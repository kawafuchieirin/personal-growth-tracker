"""Tests for Skills API handler."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_dynamodb():
    """Mock DynamoDB client."""
    with patch("api_handler.db") as mock:
        yield mock


@pytest.fixture
def client(mock_dynamodb):
    """Create test client."""
    from main import app
    return TestClient(app)


class TestListSkills:
    """Tests for list skills endpoint."""

    def test_list_skills_success(self, client, mock_dynamodb):
        """Test successful skill listing."""
        mock_dynamodb.query.return_value = [
            {
                "user_id": "user-1",
                "skill_id": "skill-1",
                "name": "Python",
                "level": 80,
                "category": "Programming",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        ]

        response = client.get("/api/v1/skills?user_id=user-1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Python"

    def test_list_skills_empty(self, client, mock_dynamodb):
        """Test empty skill list."""
        mock_dynamodb.query.return_value = []

        response = client.get("/api/v1/skills?user_id=user-1")

        assert response.status_code == 200
        assert response.json() == []


class TestGetSkill:
    """Tests for get skill endpoint."""

    def test_get_skill_success(self, client, mock_dynamodb):
        """Test successful skill retrieval."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "skill_id": "skill-1",
            "name": "Python",
            "level": 80,
            "category": "Programming",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.get("/api/v1/skills/skill-1?user_id=user-1")

        assert response.status_code == 200
        assert response.json()["skill_id"] == "skill-1"

    def test_get_skill_not_found(self, client, mock_dynamodb):
        """Test skill not found."""
        mock_dynamodb.get_item.return_value = None

        response = client.get("/api/v1/skills/nonexistent?user_id=user-1")

        assert response.status_code == 404


class TestCreateSkill:
    """Tests for create skill endpoint."""

    def test_create_skill_success(self, client, mock_dynamodb):
        """Test successful skill creation."""
        response = client.post(
            "/api/v1/skills?user_id=user-1",
            json={
                "name": "Python",
                "category": "Programming",
                "level": 50,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Python"
        assert "skill_id" in data
        mock_dynamodb.put_item.assert_called_once()

    def test_create_skill_validation_error(self, client, mock_dynamodb):
        """Test skill creation with invalid data."""
        response = client.post(
            "/api/v1/skills?user_id=user-1",
            json={"name": ""},  # Empty name
        )

        assert response.status_code == 422


class TestUpdateSkill:
    """Tests for update skill endpoint."""

    def test_update_skill_success(self, client, mock_dynamodb):
        """Test successful skill update."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "skill_id": "skill-1",
            "name": "Python",
            "level": 50,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.put(
            "/api/v1/skills/skill-1?user_id=user-1",
            json={"level": 80},
        )

        assert response.status_code == 200
        assert response.json()["level"] == 80

    def test_update_skill_not_found(self, client, mock_dynamodb):
        """Test update non-existent skill."""
        mock_dynamodb.get_item.return_value = None

        response = client.put(
            "/api/v1/skills/nonexistent?user_id=user-1",
            json={"name": "Updated"},
        )

        assert response.status_code == 404


class TestDeleteSkill:
    """Tests for delete skill endpoint."""

    def test_delete_skill_success(self, client, mock_dynamodb):
        """Test successful skill deletion."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "skill_id": "skill-1",
            "name": "Python",
        }

        response = client.delete("/api/v1/skills/skill-1?user_id=user-1")

        assert response.status_code == 204
        mock_dynamodb.delete_item.assert_called_once()

    def test_delete_skill_not_found(self, client, mock_dynamodb):
        """Test delete non-existent skill."""
        mock_dynamodb.get_item.return_value = None

        response = client.delete("/api/v1/skills/nonexistent?user_id=user-1")

        assert response.status_code == 404
