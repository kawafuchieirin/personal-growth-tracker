"""Tests for Skills API models."""

import pytest
from pydantic import ValidationError

from models import SkillCreate, SkillUpdate, SkillResponse


class TestSkillCreate:
    """Tests for SkillCreate model."""

    def test_valid_skill(self):
        """Test valid skill creation."""
        skill = SkillCreate(
            name="Python",
            category="Programming",
            level=50,
        )
        assert skill.name == "Python"
        assert skill.level == 50

    def test_name_required(self):
        """Test that name is required."""
        with pytest.raises(ValidationError):
            SkillCreate()

    def test_name_min_length(self):
        """Test name minimum length."""
        with pytest.raises(ValidationError):
            SkillCreate(name="")

    def test_name_max_length(self):
        """Test name maximum length."""
        with pytest.raises(ValidationError):
            SkillCreate(name="x" * 256)

    def test_level_range(self):
        """Test level must be between 1 and 100."""
        with pytest.raises(ValidationError):
            SkillCreate(name="Test", level=101)

        with pytest.raises(ValidationError):
            SkillCreate(name="Test", level=0)


class TestSkillUpdate:
    """Tests for SkillUpdate model."""

    def test_partial_update(self):
        """Test partial update with only some fields."""
        update = SkillUpdate(name="New Name")
        assert update.name == "New Name"
        assert update.level is None

    def test_empty_update(self):
        """Test empty update is valid."""
        update = SkillUpdate()
        assert update.name is None


class TestSkillResponse:
    """Tests for SkillResponse model."""

    def test_valid_response(self):
        """Test valid response model."""
        response = SkillResponse(
            skill_id="skill-1",
            user_id="user-1",
            name="Python",
            level=80,
            category="Programming",
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
        )
        assert response.skill_id == "skill-1"
        assert response.level == 80
