"""Habits API Lambda entrypoint."""

import logging
from datetime import date

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic import BaseModel

from api_handler import router
from client import HabitsClient, get_settings
from contribution import calculate_contributions
from models import ContributionResponse
from slack_notifier import format_reminder_message, send_slack_notification

logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="Habits API",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(router, prefix="/api/v1")


# Contribution endpoint (outside of router for cleaner URL)
@app.get("/api/v1/habits/contributions", response_model=ContributionResponse)
async def get_contributions(
    user_id: str, year: int | None = None
) -> ContributionResponse:
    """Get contribution data for a user's habits in a given year."""
    if year is None:
        year = date.today().year

    db = HabitsClient(settings.habits_table_name, settings.habit_logs_table_name)

    # Get active habits count
    habits = db.query_habits(user_id)
    active_habits = [h for h in habits if h.get("is_active", True)]
    habit_count = len(active_habits)

    if habit_count == 0:
        raise HTTPException(status_code=404, detail="No habits found for user")

    # Get all logs for the year
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    logs = db.query_habit_logs_by_user(user_id, start_date, end_date)

    return calculate_contributions(logs, year, habit_count)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "api": "habits"}


class ReminderResponse(BaseModel):
    """Response model for reminder endpoint."""

    success: bool
    message: str
    incomplete_count: int
    total_count: int


@app.post("/api/v1/habits/reminder", response_model=ReminderResponse)
async def send_reminder(user_id: str) -> ReminderResponse:
    """Send Slack reminder for incomplete habits.

    This endpoint checks for incomplete habits for the current day
    and sends a Slack notification if there are any.
    """
    if not settings.slack_webhook_url:
        raise HTTPException(
            status_code=503,
            detail="Slack webhook URL is not configured",
        )

    db = HabitsClient(settings.habits_table_name, settings.habit_logs_table_name)

    # Get all active habits
    habits = db.query_habits(user_id)
    active_habits = [h for h in habits if h.get("is_active", True)]

    if not active_habits:
        return ReminderResponse(
            success=True,
            message="No active habits found",
            incomplete_count=0,
            total_count=0,
        )

    # Get today's logs
    today = date.today().isoformat()
    logs = db.query_habit_logs_by_user(user_id, today, today)
    completed_habit_ids = {
        log["habit_id"] for log in logs if log.get("completed", False)
    }

    # Filter for habits that are due today
    today_weekday = date.today().weekday()  # 0=Monday, 6=Sunday
    due_habits = []
    for habit in active_habits:
        frequency = habit.get("frequency", "daily")
        if frequency == "daily":
            due_habits.append(habit)
        elif frequency == "weekdays" and today_weekday < 5:
            due_habits.append(habit)
        elif frequency == "weekly" and today_weekday == 0:  # Monday
            due_habits.append(habit)

    if not due_habits:
        return ReminderResponse(
            success=True,
            message="No habits due today",
            incomplete_count=0,
            total_count=0,
        )

    # Find incomplete habits with reminder enabled
    incomplete_habits = [
        h
        for h in due_habits
        if h["habit_id"] not in completed_habit_ids and h.get("reminder_enabled", False)
    ]

    completed_count = len(
        [h for h in due_habits if h["habit_id"] in completed_habit_ids]
    )
    total_count = len(due_habits)

    if not incomplete_habits:
        return ReminderResponse(
            success=True,
            message="All habits with reminders are completed",
            incomplete_count=0,
            total_count=total_count,
        )

    # Format and send message
    message = format_reminder_message(
        incomplete_habits=incomplete_habits,
        total_habits=total_count,
        completed_count=completed_count,
    )

    success = send_slack_notification(settings.slack_webhook_url, message)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send Slack notification",
        )

    return ReminderResponse(
        success=True,
        message=f"Reminder sent for {len(incomplete_habits)} incomplete habits",
        incomplete_count=len(incomplete_habits),
        total_count=total_count,
    )


def lambda_reminder_handler(event: dict, context: object) -> dict:
    """Lambda handler for scheduled reminders via EventBridge.

    This function is designed to be triggered by EventBridge (CloudWatch Events)
    on a schedule to send reminders for incomplete habits.
    """
    import asyncio

    # Default user_id for personal app
    user_id = event.get("user_id", "default")

    async def run_reminder() -> dict:
        try:
            result = await send_reminder(user_id)
            return {
                "statusCode": 200,
                "body": result.model_dump_json(),
            }
        except HTTPException as e:
            return {
                "statusCode": e.status_code,
                "body": {"detail": e.detail},
            }
        except Exception as e:
            logger.error(f"Reminder handler error: {e}", exc_info=True)
            return {
                "statusCode": 500,
                "body": {"detail": str(e)},
            }

    return asyncio.get_event_loop().run_until_complete(run_reminder())


handler = Mangum(app, lifespan="off")
