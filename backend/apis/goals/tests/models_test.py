"""Tests for Goals API models."""

import pytest
from pydantic import ValidationError

from models import GoalCreate, GoalUpdate, GoalResponse, GoalStatus


class TestGoalCreate:
    """Tests for GoalCreate model."""

    def test_valid_goal(self):
        """Test valid goal creation."""
        goal = GoalCreate(
            title="Learn Python",
            description="Master Python programming",
            priority=5,
        )
        assert goal.title == "Learn Python"
        assert goal.status == GoalStatus.NOT_STARTED

    def test_title_required(self):
        """Test that title is required."""
        with pytest.raises(ValidationError):
            GoalCreate()

    def test_title_min_length(self):
        """Test title minimum length."""
        with pytest.raises(ValidationError):
            GoalCreate(title="")

    def test_title_max_length(self):
        """Test title maximum length."""
        with pytest.raises(ValidationError):
            GoalCreate(title="x" * 256)

    def test_priority_range(self):
        """Test priority must be between 0 and 10."""
        with pytest.raises(ValidationError):
            GoalCreate(title="Test", priority=11)

        with pytest.raises(ValidationError):
            GoalCreate(title="Test", priority=-1)


class TestGoalUpdate:
    """Tests for GoalUpdate model."""

    def test_partial_update(self):
        """Test partial update with only some fields."""
        update = GoalUpdate(title="New Title")
        assert update.title == "New Title"
        assert update.status is None

    def test_empty_update(self):
        """Test empty update is valid."""
        update = GoalUpdate()
        assert update.title is None


class TestGoalResponse:
    """Tests for GoalResponse model."""

    def test_valid_response(self):
        """Test valid response model."""
        response = GoalResponse(
            goal_id="goal-1",
            user_id="user-1",
            title="Learn Python",
            status=GoalStatus.IN_PROGRESS,
            priority=5,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
        )
        assert response.goal_id == "goal-1"
        assert response.status == GoalStatus.IN_PROGRESS


class TestGoalStatus:
    """Tests for GoalStatus enum."""

    def test_status_values(self):
        """Test all status values are valid."""
        assert GoalStatus.NOT_STARTED.value == "not_started"
        assert GoalStatus.IN_PROGRESS.value == "in_progress"
        assert GoalStatus.COMPLETED.value == "completed"
        assert GoalStatus.ON_HOLD.value == "on_hold"
