"""Tests for Goals API handler."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_dynamodb():
    """Mock DynamoDB client."""
    with patch("api_handler.DynamoDBClient") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def client(mock_dynamodb):
    """Create test client."""
    from main import app
    return TestClient(app)


class TestListGoals:
    """Tests for list goals endpoint."""

    def test_list_goals_success(self, client, mock_dynamodb):
        """Test successful goal listing."""
        mock_dynamodb.query.return_value = [
            {
                "user_id": "user-1",
                "goal_id": "goal-1",
                "title": "Learn Python",
                "status": "in_progress",
                "priority": 5,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        ]

        response = client.get("/api/v1/goals?user_id=user-1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Learn Python"

    def test_list_goals_empty(self, client, mock_dynamodb):
        """Test empty goal list."""
        mock_dynamodb.query.return_value = []

        response = client.get("/api/v1/goals?user_id=user-1")

        assert response.status_code == 200
        assert response.json() == []


class TestGetGoal:
    """Tests for get goal endpoint."""

    def test_get_goal_success(self, client, mock_dynamodb):
        """Test successful goal retrieval."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "goal_id": "goal-1",
            "title": "Learn Python",
            "status": "in_progress",
            "priority": 5,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.get("/api/v1/goals/goal-1?user_id=user-1")

        assert response.status_code == 200
        assert response.json()["goal_id"] == "goal-1"

    def test_get_goal_not_found(self, client, mock_dynamodb):
        """Test goal not found."""
        mock_dynamodb.get_item.return_value = None

        response = client.get("/api/v1/goals/nonexistent?user_id=user-1")

        assert response.status_code == 404


class TestCreateGoal:
    """Tests for create goal endpoint."""

    def test_create_goal_success(self, client, mock_dynamodb):
        """Test successful goal creation."""
        response = client.post(
            "/api/v1/goals?user_id=user-1",
            json={
                "title": "Learn Python",
                "description": "Master Python programming",
                "priority": 5,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Learn Python"
        assert "goal_id" in data
        mock_dynamodb.put_item.assert_called_once()

    def test_create_goal_validation_error(self, client, mock_dynamodb):
        """Test goal creation with invalid data."""
        response = client.post(
            "/api/v1/goals?user_id=user-1",
            json={"title": ""},  # Empty title
        )

        assert response.status_code == 422


class TestUpdateGoal:
    """Tests for update goal endpoint."""

    def test_update_goal_success(self, client, mock_dynamodb):
        """Test successful goal update."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "goal_id": "goal-1",
            "title": "Learn Python",
            "status": "not_started",
            "priority": 5,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.put(
            "/api/v1/goals/goal-1?user_id=user-1",
            json={"status": "in_progress"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "in_progress"

    def test_update_goal_not_found(self, client, mock_dynamodb):
        """Test update non-existent goal."""
        mock_dynamodb.get_item.return_value = None

        response = client.put(
            "/api/v1/goals/nonexistent?user_id=user-1",
            json={"title": "Updated"},
        )

        assert response.status_code == 404


class TestDeleteGoal:
    """Tests for delete goal endpoint."""

    def test_delete_goal_success(self, client, mock_dynamodb):
        """Test successful goal deletion."""
        mock_dynamodb.get_item.return_value = {
            "user_id": "user-1",
            "goal_id": "goal-1",
            "title": "Learn Python",
        }

        response = client.delete("/api/v1/goals/goal-1?user_id=user-1")

        assert response.status_code == 204
        mock_dynamodb.delete_item.assert_called_once()

    def test_delete_goal_not_found(self, client, mock_dynamodb):
        """Test delete non-existent goal."""
        mock_dynamodb.get_item.return_value = None

        response = client.delete("/api/v1/goals/nonexistent?user_id=user-1")

        assert response.status_code == 404
