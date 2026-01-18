"""Roadmaps API handler."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from client import RoadmapsClient, get_settings
from models import RoadmapCreate, RoadmapUpdate, RoadmapResponse

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

settings = get_settings()
db = RoadmapsClient(settings.roadmaps_table_name)


@router.get("", response_model=list[RoadmapResponse])
async def list_roadmaps(goal_id: str) -> list[RoadmapResponse]:
    """List all milestones for a goal."""
    items = db.query("goal_id", goal_id)
    return [RoadmapResponse(**item) for item in items]


@router.get("/{milestone_id}", response_model=RoadmapResponse)
async def get_roadmap(milestone_id: str, goal_id: str) -> RoadmapResponse:
    """Get a single milestone by ID."""
    item = db.get_item({"goal_id": goal_id, "milestone_id": milestone_id})
    if not item:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return RoadmapResponse(**item)


@router.post("", response_model=RoadmapResponse, status_code=201)
async def create_roadmap(goal_id: str, milestone: RoadmapCreate) -> RoadmapResponse:
    """Create a new milestone."""
    milestone_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    item = {
        "goal_id": goal_id,
        "milestone_id": milestone_id,
        **milestone.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    db.put_item(item)
    return RoadmapResponse(**item)


@router.put("/{milestone_id}", response_model=RoadmapResponse)
async def update_roadmap(
    milestone_id: str, goal_id: str, milestone: RoadmapUpdate
) -> RoadmapResponse:
    """Update a milestone."""
    existing = db.get_item({"goal_id": goal_id, "milestone_id": milestone_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Milestone not found")

    update_data = milestone.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    updated_item = {**existing, **update_data}
    db.put_item(updated_item)
    return RoadmapResponse(**updated_item)


@router.delete("/{milestone_id}", status_code=204)
async def delete_roadmap(milestone_id: str, goal_id: str) -> None:
    """Delete a milestone."""
    existing = db.get_item({"goal_id": goal_id, "milestone_id": milestone_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Milestone not found")

    db.delete_item({"goal_id": goal_id, "milestone_id": milestone_id})
