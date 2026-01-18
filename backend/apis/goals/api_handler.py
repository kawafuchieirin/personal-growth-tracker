"""Goals API handler."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from client import GoalsClient, get_settings
from models import GoalCreate, GoalResponse, GoalUpdate

router = APIRouter(prefix="/goals", tags=["goals"])

settings = get_settings()
db = GoalsClient(settings.goals_table_name)


@router.get("", response_model=list[GoalResponse])
async def list_goals(user_id: str) -> list[GoalResponse]:
    """List all goals for a user."""
    items = db.query("user_id", user_id)
    return [GoalResponse(**item) for item in items]


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: str, user_id: str) -> GoalResponse:
    """Get a single goal by ID."""
    item = db.get_item({"user_id": user_id, "goal_id": goal_id})
    if not item:
        raise HTTPException(status_code=404, detail="Goal not found")
    return GoalResponse(**item)


@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(user_id: str, goal: GoalCreate) -> GoalResponse:
    """Create a new goal."""
    goal_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()

    item = {
        "user_id": user_id,
        "goal_id": goal_id,
        **goal.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    db.put_item(item)
    return GoalResponse(**item)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, user_id: str, goal: GoalUpdate) -> GoalResponse:
    """Update a goal."""
    existing = db.get_item({"user_id": user_id, "goal_id": goal_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(UTC).isoformat()

    updated_item = {**existing, **update_data}
    db.put_item(updated_item)
    return GoalResponse(**updated_item)


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: str, user_id: str) -> None:
    """Delete a goal."""
    existing = db.get_item({"user_id": user_id, "goal_id": goal_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete_item({"user_id": user_id, "goal_id": goal_id})
