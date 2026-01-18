"""Data models for Roadmaps API."""

from enum import Enum
from pydantic import BaseModel, Field


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""

    created_at: str | None = None
    updated_at: str | None = None


class MilestoneStatus(str, Enum):
    """Milestone status enumeration."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class RoadmapBase(BaseModel):
    """Base schema for roadmap milestones."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    target_date: str | None = None
    status: MilestoneStatus = MilestoneStatus.NOT_STARTED
    order: int = Field(default=0, ge=0)


class RoadmapCreate(RoadmapBase):
    """Schema for creating a milestone."""

    pass


class RoadmapUpdate(BaseModel):
    """Schema for updating a milestone."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    target_date: str | None = None
    status: MilestoneStatus | None = None
    order: int | None = Field(None, ge=0)


class RoadmapResponse(RoadmapBase, TimestampMixin):
    """Schema for milestone response."""

    milestone_id: str
    goal_id: str
