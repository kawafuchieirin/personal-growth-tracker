"""Tests for Roadmaps API handler."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_dynamodb():
    """Mock DynamoDB client."""
    with patch("api_handler.RoadmapsClient") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def client(mock_dynamodb):
    """Create test client."""
    from main import app
    return TestClient(app)


class TestListRoadmaps:
    """Tests for list roadmaps endpoint."""

    def test_list_roadmaps_success(self, client, mock_dynamodb):
        """Test successful roadmap listing."""
        mock_dynamodb.query.return_value = [
            {
                "goal_id": "goal-1",
                "milestone_id": "milestone-1",
                "title": "Setup environment",
                "status": "completed",
                "order": 1,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        ]

        response = client.get("/api/v1/roadmaps?goal_id=goal-1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Setup environment"

    def test_list_roadmaps_empty(self, client, mock_dynamodb):
        """Test empty roadmap list."""
        mock_dynamodb.query.return_value = []

        response = client.get("/api/v1/roadmaps?goal_id=goal-1")

        assert response.status_code == 200
        assert response.json() == []


class TestGetRoadmap:
    """Tests for get roadmap endpoint."""

    def test_get_roadmap_success(self, client, mock_dynamodb):
        """Test successful roadmap retrieval."""
        mock_dynamodb.get_item.return_value = {
            "goal_id": "goal-1",
            "milestone_id": "milestone-1",
            "title": "Setup environment",
            "status": "completed",
            "order": 1,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.get("/api/v1/roadmaps/milestone-1?goal_id=goal-1")

        assert response.status_code == 200
        assert response.json()["milestone_id"] == "milestone-1"

    def test_get_roadmap_not_found(self, client, mock_dynamodb):
        """Test roadmap not found."""
        mock_dynamodb.get_item.return_value = None

        response = client.get("/api/v1/roadmaps/nonexistent?goal_id=goal-1")

        assert response.status_code == 404


class TestCreateRoadmap:
    """Tests for create roadmap endpoint."""

    def test_create_roadmap_success(self, client, mock_dynamodb):
        """Test successful roadmap creation."""
        response = client.post(
            "/api/v1/roadmaps?goal_id=goal-1",
            json={
                "title": "Setup environment",
                "description": "Install required tools",
                "order": 1,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Setup environment"
        assert "milestone_id" in data
        mock_dynamodb.put_item.assert_called_once()

    def test_create_roadmap_validation_error(self, client, mock_dynamodb):
        """Test roadmap creation with invalid data."""
        response = client.post(
            "/api/v1/roadmaps?goal_id=goal-1",
            json={"title": ""},  # Empty title
        )

        assert response.status_code == 422


class TestUpdateRoadmap:
    """Tests for update roadmap endpoint."""

    def test_update_roadmap_success(self, client, mock_dynamodb):
        """Test successful roadmap update."""
        mock_dynamodb.get_item.return_value = {
            "goal_id": "goal-1",
            "milestone_id": "milestone-1",
            "title": "Setup environment",
            "status": "not_started",
            "order": 1,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.put(
            "/api/v1/roadmaps/milestone-1?goal_id=goal-1",
            json={"status": "completed"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    def test_update_roadmap_not_found(self, client, mock_dynamodb):
        """Test update non-existent roadmap."""
        mock_dynamodb.get_item.return_value = None

        response = client.put(
            "/api/v1/roadmaps/nonexistent?goal_id=goal-1",
            json={"title": "Updated"},
        )

        assert response.status_code == 404


class TestDeleteRoadmap:
    """Tests for delete roadmap endpoint."""

    def test_delete_roadmap_success(self, client, mock_dynamodb):
        """Test successful roadmap deletion."""
        mock_dynamodb.get_item.return_value = {
            "goal_id": "goal-1",
            "milestone_id": "milestone-1",
            "title": "Setup environment",
        }

        response = client.delete("/api/v1/roadmaps/milestone-1?goal_id=goal-1")

        assert response.status_code == 204
        mock_dynamodb.delete_item.assert_called_once()

    def test_delete_roadmap_not_found(self, client, mock_dynamodb):
        """Test delete non-existent roadmap."""
        mock_dynamodb.get_item.return_value = None

        response = client.delete("/api/v1/roadmaps/nonexistent?goal_id=goal-1")

        assert response.status_code == 404
