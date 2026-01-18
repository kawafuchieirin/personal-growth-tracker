"""Data models for Habits API."""

from enum import Enum

from pydantic import BaseModel, Field


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""

    created_at: str | None = None
    updated_at: str | None = None


class HabitFrequency(str, Enum):
    """Habit frequency enumeration."""

    DAILY = "daily"
    WEEKDAYS = "weekdays"
    WEEKLY = "weekly"


class HabitBase(BaseModel):
    """Base schema for habits."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    frequency: HabitFrequency = HabitFrequency.DAILY
    reminder_time: str | None = Field(None, pattern=r"^([01]\d|2[0-3]):([0-5]\d)$")
    reminder_enabled: bool = False
    color: str = Field(default="#22c55e", pattern=r"^#[0-9A-Fa-f]{6}$")
    is_active: bool = True


class HabitCreate(HabitBase):
    """Schema for creating a habit."""

    pass


class HabitUpdate(BaseModel):
    """Schema for updating a habit."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    frequency: HabitFrequency | None = None
    reminder_time: str | None = Field(None, pattern=r"^([01]\d|2[0-3]):([0-5]\d)$")
    reminder_enabled: bool | None = None
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_active: bool | None = None


class HabitResponse(HabitBase, TimestampMixin):
    """Schema for habit response."""

    habit_id: str
    user_id: str


class HabitLogBase(BaseModel):
    """Base schema for habit logs."""

    completed: bool = True
    note: str | None = None


class HabitLogCreate(HabitLogBase):
    """Schema for creating a habit log."""

    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


class HabitLogResponse(HabitLogBase):
    """Schema for habit log response."""

    habit_id: str
    date: str
    completed_at: str | None = None


class ContributionData(BaseModel):
    """Schema for contribution data."""

    date: str
    count: int
    level: int  # 0-4


class ContributionResponse(BaseModel):
    """Schema for contribution response."""

    year: int
    total_contributions: int
    data: list[ContributionData]
