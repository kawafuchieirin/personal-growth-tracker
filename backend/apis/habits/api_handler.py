"""Habits API handler."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from client import HabitsClient, get_settings
from models import (
    HabitCreate,
    HabitLogCreate,
    HabitLogResponse,
    HabitResponse,
    HabitUpdate,
)

router = APIRouter(prefix="/habits", tags=["habits"])

settings = get_settings()
db = HabitsClient(settings.habits_table_name, settings.habit_logs_table_name)


# Habits CRUD endpoints
@router.get("", response_model=list[HabitResponse])
async def list_habits(user_id: str) -> list[HabitResponse]:
    """List all habits for a user."""
    items = db.query_habits(user_id)
    return [HabitResponse(**item) for item in items]


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(habit_id: str, user_id: str) -> HabitResponse:
    """Get a single habit by ID."""
    item = db.get_habit(user_id, habit_id)
    if not item:
        raise HTTPException(status_code=404, detail="Habit not found")
    return HabitResponse(**item)


@router.post("", response_model=HabitResponse, status_code=201)
async def create_habit(user_id: str, habit: HabitCreate) -> HabitResponse:
    """Create a new habit."""
    habit_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()

    item = {
        "user_id": user_id,
        "habit_id": habit_id,
        **habit.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    db.put_habit(item)
    return HabitResponse(**item)


@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str, user_id: str, habit: HabitUpdate
) -> HabitResponse:
    """Update a habit."""
    existing = db.get_habit(user_id, habit_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Habit not found")

    update_data = habit.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(UTC).isoformat()

    updated_item = {**existing, **update_data}
    db.put_habit(updated_item)
    return HabitResponse(**updated_item)


@router.delete("/{habit_id}", status_code=204)
async def delete_habit(habit_id: str, user_id: str) -> None:
    """Delete a habit and all its logs."""
    existing = db.get_habit(user_id, habit_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Delete all logs for this habit
    db.batch_delete_habit_logs(habit_id)
    # Delete the habit
    db.delete_habit(user_id, habit_id)


# Habit Logs endpoints
@router.get("/{habit_id}/logs", response_model=list[HabitLogResponse])
async def list_habit_logs(
    habit_id: str,
    user_id: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[HabitLogResponse]:
    """List habit logs for a habit with optional date range."""
    # Verify habit exists and belongs to user
    habit = db.get_habit(user_id, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    items = db.query_habit_logs(habit_id, start_date, end_date)
    return [HabitLogResponse(**item) for item in items]


@router.post("/{habit_id}/logs", response_model=HabitLogResponse, status_code=201)
async def create_habit_log(
    habit_id: str, user_id: str, log: HabitLogCreate
) -> HabitLogResponse:
    """Create or update a habit log (mark habit as completed)."""
    # Verify habit exists and belongs to user
    habit = db.get_habit(user_id, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    now = datetime.now(UTC).isoformat()

    item = {
        "habit_id": habit_id,
        "user_id": user_id,
        "date": log.date,
        "completed": log.completed,
        "completed_at": now if log.completed else None,
        "note": log.note,
    }
    db.put_habit_log(item)
    return HabitLogResponse(**item)


@router.delete("/{habit_id}/logs/{date}", status_code=204)
async def delete_habit_log(habit_id: str, date: str, user_id: str) -> None:
    """Delete a habit log (unmark habit completion)."""
    # Verify habit exists and belongs to user
    habit = db.get_habit(user_id, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    existing = db.get_habit_log(habit_id, date)
    if not existing:
        raise HTTPException(status_code=404, detail="Habit log not found")

    db.delete_habit_log(habit_id, date)
