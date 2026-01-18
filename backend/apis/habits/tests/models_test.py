"""Tests for Habits API models."""

import pytest
from pydantic import ValidationError

from models import (
    ContributionData,
    HabitCreate,
    HabitFrequency,
    HabitLogCreate,
    HabitResponse,
    HabitUpdate,
)


class TestHabitCreate:
    """Tests for HabitCreate model."""

    def test_valid_habit(self):
        """Test creating a valid habit."""
        habit = HabitCreate(name="Exercise")
        assert habit.name == "Exercise"
        assert habit.frequency == HabitFrequency.DAILY
        assert habit.color == "#22c55e"
        assert habit.is_active is True

    def test_habit_with_all_fields(self):
        """Test creating a habit with all fields."""
        habit = HabitCreate(
            name="Morning Run",
            description="Run 5km every morning",
            frequency=HabitFrequency.WEEKDAYS,
            reminder_time="06:00",
            reminder_enabled=True,
            color="#3b82f6",
            is_active=True,
        )
        assert habit.name == "Morning Run"
        assert habit.reminder_time == "06:00"
        assert habit.frequency == HabitFrequency.WEEKDAYS

    def test_habit_empty_name_fails(self):
        """Test that empty name fails validation."""
        with pytest.raises(ValidationError):
            HabitCreate(name="")

    def test_habit_invalid_time_format(self):
        """Test that invalid time format fails."""
        with pytest.raises(ValidationError):
            HabitCreate(name="Test", reminder_time="6:00")

    def test_habit_invalid_color_format(self):
        """Test that invalid color format fails."""
        with pytest.raises(ValidationError):
            HabitCreate(name="Test", color="red")


class TestHabitUpdate:
    """Tests for HabitUpdate model."""

    def test_partial_update(self):
        """Test partial update with only some fields."""
        update = HabitUpdate(name="Updated Name")
        assert update.name == "Updated Name"
        assert update.description is None
        assert update.frequency is None

    def test_empty_update(self):
        """Test empty update is valid."""
        update = HabitUpdate()
        assert update.name is None


class TestHabitResponse:
    """Tests for HabitResponse model."""

    def test_response_model(self):
        """Test response model creation."""
        response = HabitResponse(
            habit_id="habit-1",
            user_id="user-1",
            name="Exercise",
            frequency=HabitFrequency.DAILY,
            color="#22c55e",
            is_active=True,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
        )
        assert response.habit_id == "habit-1"
        assert response.user_id == "user-1"


class TestHabitLogCreate:
    """Tests for HabitLogCreate model."""

    def test_valid_log(self):
        """Test creating a valid habit log."""
        log = HabitLogCreate(date="2024-01-15")
        assert log.date == "2024-01-15"
        assert log.completed is True

    def test_log_with_note(self):
        """Test creating a log with note."""
        log = HabitLogCreate(date="2024-01-15", completed=True, note="Great session!")
        assert log.note == "Great session!"

    def test_invalid_date_format(self):
        """Test that invalid date format fails."""
        with pytest.raises(ValidationError):
            HabitLogCreate(date="01-15-2024")


class TestContributionData:
    """Tests for ContributionData model."""

    def test_contribution_data(self):
        """Test contribution data creation."""
        data = ContributionData(date="2024-01-15", count=3, level=2)
        assert data.date == "2024-01-15"
        assert data.count == 3
        assert data.level == 2
