"""Skills API handler."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from client import SkillsClient, get_settings
from models import SkillCreate, SkillResponse, SkillUpdate

router = APIRouter(prefix="/skills", tags=["skills"])

settings = get_settings()
db = SkillsClient(settings.skills_table_name)


@router.get("", response_model=list[SkillResponse])
async def list_skills(user_id: str) -> list[SkillResponse]:
    """List all skills for a user."""
    items = db.query("user_id", user_id)
    return [SkillResponse(**item) for item in items]


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: str, user_id: str) -> SkillResponse:
    """Get a single skill by ID."""
    item = db.get_item({"user_id": user_id, "skill_id": skill_id})
    if not item:
        raise HTTPException(status_code=404, detail="Skill not found")
    return SkillResponse(**item)


@router.post("", response_model=SkillResponse, status_code=201)
async def create_skill(user_id: str, skill: SkillCreate) -> SkillResponse:
    """Create a new skill."""
    skill_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()

    item = {
        "user_id": user_id,
        "skill_id": skill_id,
        **skill.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    db.put_item(item)
    return SkillResponse(**item)


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str, user_id: str, skill: SkillUpdate
) -> SkillResponse:
    """Update a skill."""
    existing = db.get_item({"user_id": user_id, "skill_id": skill_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Skill not found")

    update_data = skill.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(UTC).isoformat()

    updated_item = {**existing, **update_data}
    db.put_item(updated_item)
    return SkillResponse(**updated_item)


@router.delete("/{skill_id}", status_code=204)
async def delete_skill(skill_id: str, user_id: str) -> None:
    """Delete a skill."""
    existing = db.get_item({"user_id": user_id, "skill_id": skill_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete_item({"user_id": user_id, "skill_id": skill_id})
