"""Data models for Goals API."""

from enum import Enum

from pydantic import BaseModel, Field


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""

    created_at: str | None = None
    updated_at: str | None = None


class GoalStatus(str, Enum):
    """Goal status enumeration."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class GoalBase(BaseModel):
    """Base schema for goals."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    target_date: str | None = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    priority: int = Field(default=0, ge=0, le=10)


class GoalCreate(GoalBase):
    """Schema for creating a goal."""

    pass


class GoalUpdate(BaseModel):
    """Schema for updating a goal."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    target_date: str | None = None
    status: GoalStatus | None = None
    priority: int | None = Field(None, ge=0, le=10)


class GoalResponse(GoalBase, TimestampMixin):
    """Schema for goal response."""

    goal_id: str
    user_id: str
