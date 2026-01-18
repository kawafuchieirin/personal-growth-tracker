"""Tests for Roadmaps API models."""

import pytest
from pydantic import ValidationError

from models import MilestoneStatus, RoadmapCreate, RoadmapResponse, RoadmapUpdate


class TestRoadmapCreate:
    """Tests for RoadmapCreate model."""

    def test_valid_roadmap(self):
        """Test valid roadmap creation."""
        roadmap = RoadmapCreate(
            title="Setup environment",
            description="Install required tools",
            order=1,
        )
        assert roadmap.title == "Setup environment"
        assert roadmap.status == MilestoneStatus.NOT_STARTED

    def test_title_required(self):
        """Test that title is required."""
        with pytest.raises(ValidationError):
            RoadmapCreate()

    def test_title_min_length(self):
        """Test title minimum length."""
        with pytest.raises(ValidationError):
            RoadmapCreate(title="")

    def test_title_max_length(self):
        """Test title maximum length."""
        with pytest.raises(ValidationError):
            RoadmapCreate(title="x" * 256)

    def test_order_range(self):
        """Test order must be non-negative."""
        with pytest.raises(ValidationError):
            RoadmapCreate(title="Test", order=-1)


class TestRoadmapUpdate:
    """Tests for RoadmapUpdate model."""

    def test_partial_update(self):
        """Test partial update with only some fields."""
        update = RoadmapUpdate(title="New Title")
        assert update.title == "New Title"
        assert update.status is None

    def test_empty_update(self):
        """Test empty update is valid."""
        update = RoadmapUpdate()
        assert update.title is None


class TestRoadmapResponse:
    """Tests for RoadmapResponse model."""

    def test_valid_response(self):
        """Test valid response model."""
        response = RoadmapResponse(
            milestone_id="milestone-1",
            goal_id="goal-1",
            title="Setup environment",
            status=MilestoneStatus.COMPLETED,
            order=1,
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
        )
        assert response.milestone_id == "milestone-1"
        assert response.status == MilestoneStatus.COMPLETED


class TestMilestoneStatus:
    """Tests for MilestoneStatus enum."""

    def test_status_values(self):
        """Test all status values are valid."""
        assert MilestoneStatus.NOT_STARTED.value == "not_started"
        assert MilestoneStatus.IN_PROGRESS.value == "in_progress"
        assert MilestoneStatus.COMPLETED.value == "completed"
        assert MilestoneStatus.BLOCKED.value == "blocked"
