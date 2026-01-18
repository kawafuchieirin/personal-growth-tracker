"""Data models for Skills API."""

from pydantic import BaseModel, Field


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""

    created_at: str | None = None
    updated_at: str | None = None


class SkillBase(BaseModel):
    """Base schema for skills."""

    name: str = Field(..., min_length=1, max_length=255)
    category: str | None = None
    level: int = Field(default=1, ge=1, le=100)
    description: str | None = None


class SkillCreate(SkillBase):
    """Schema for creating a skill."""

    pass


class SkillUpdate(BaseModel):
    """Schema for updating a skill."""

    name: str | None = Field(None, min_length=1, max_length=255)
    category: str | None = None
    level: int | None = Field(None, ge=1, le=100)
    description: str | None = None


class SkillResponse(SkillBase, TimestampMixin):
    """Schema for skill response."""

    skill_id: str
    user_id: str
