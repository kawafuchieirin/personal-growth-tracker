"""Tests for Habits API handler."""

from unittest.mock import patch

import pytest
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


class TestListHabits:
    """Tests for list habits endpoint."""

    def test_list_habits_success(self, client, mock_dynamodb):
        """Test successful habit listing."""
        mock_dynamodb.query_habits.return_value = [
            {
                "user_id": "user-1",
                "habit_id": "habit-1",
                "name": "Exercise",
                "frequency": "daily",
                "color": "#22c55e",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        ]

        response = client.get("/api/v1/habits?user_id=user-1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Exercise"

    def test_list_habits_empty(self, client, mock_dynamodb):
        """Test empty habit list."""
        mock_dynamodb.query_habits.return_value = []

        response = client.get("/api/v1/habits?user_id=user-1")

        assert response.status_code == 200
        assert response.json() == []


class TestGetHabit:
    """Tests for get habit endpoint."""

    def test_get_habit_success(self, client, mock_dynamodb):
        """Test successful habit retrieval."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
            "frequency": "daily",
            "color": "#22c55e",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.get("/api/v1/habits/habit-1?user_id=user-1")

        assert response.status_code == 200
        assert response.json()["habit_id"] == "habit-1"

    def test_get_habit_not_found(self, client, mock_dynamodb):
        """Test habit not found."""
        mock_dynamodb.get_habit.return_value = None

        response = client.get("/api/v1/habits/nonexistent?user_id=user-1")

        assert response.status_code == 404


class TestCreateHabit:
    """Tests for create habit endpoint."""

    def test_create_habit_success(self, client, mock_dynamodb):
        """Test successful habit creation."""
        response = client.post(
            "/api/v1/habits?user_id=user-1",
            json={
                "name": "Exercise",
                "description": "Daily workout",
                "frequency": "daily",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Exercise"
        assert "habit_id" in data
        mock_dynamodb.put_habit.assert_called_once()

    def test_create_habit_validation_error(self, client, mock_dynamodb):
        """Test habit creation with invalid data."""
        response = client.post(
            "/api/v1/habits?user_id=user-1",
            json={"name": ""},  # Empty name
        )

        assert response.status_code == 422


class TestUpdateHabit:
    """Tests for update habit endpoint."""

    def test_update_habit_success(self, client, mock_dynamodb):
        """Test successful habit update."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
            "frequency": "daily",
            "color": "#22c55e",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

        response = client.put(
            "/api/v1/habits/habit-1?user_id=user-1",
            json={"name": "Morning Exercise"},
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Morning Exercise"

    def test_update_habit_not_found(self, client, mock_dynamodb):
        """Test update non-existent habit."""
        mock_dynamodb.get_habit.return_value = None

        response = client.put(
            "/api/v1/habits/nonexistent?user_id=user-1",
            json={"name": "Updated"},
        )

        assert response.status_code == 404


class TestDeleteHabit:
    """Tests for delete habit endpoint."""

    def test_delete_habit_success(self, client, mock_dynamodb):
        """Test successful habit deletion."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
        }

        response = client.delete("/api/v1/habits/habit-1?user_id=user-1")

        assert response.status_code == 204
        mock_dynamodb.batch_delete_habit_logs.assert_called_once()
        mock_dynamodb.delete_habit.assert_called_once()

    def test_delete_habit_not_found(self, client, mock_dynamodb):
        """Test delete non-existent habit."""
        mock_dynamodb.get_habit.return_value = None

        response = client.delete("/api/v1/habits/nonexistent?user_id=user-1")

        assert response.status_code == 404


class TestHabitLogs:
    """Tests for habit logs endpoints."""

    def test_list_logs_success(self, client, mock_dynamodb):
        """Test successful habit logs listing."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
        }
        mock_dynamodb.query_habit_logs.return_value = [
            {
                "habit_id": "habit-1",
                "date": "2024-01-15",
                "completed": True,
                "completed_at": "2024-01-15T10:00:00Z",
            }
        ]

        response = client.get("/api/v1/habits/habit-1/logs?user_id=user-1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_list_logs_habit_not_found(self, client, mock_dynamodb):
        """Test listing logs for non-existent habit."""
        mock_dynamodb.get_habit.return_value = None

        response = client.get("/api/v1/habits/nonexistent/logs?user_id=user-1")

        assert response.status_code == 404

    def test_create_log_success(self, client, mock_dynamodb):
        """Test successful habit log creation."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
        }

        response = client.post(
            "/api/v1/habits/habit-1/logs?user_id=user-1",
            json={"date": "2024-01-15", "completed": True},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["date"] == "2024-01-15"
        assert data["completed"] is True

    def test_delete_log_success(self, client, mock_dynamodb):
        """Test successful habit log deletion."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
        }
        mock_dynamodb.get_habit_log.return_value = {
            "habit_id": "habit-1",
            "date": "2024-01-15",
            "completed": True,
        }

        response = client.delete(
            "/api/v1/habits/habit-1/logs/2024-01-15?user_id=user-1"
        )

        assert response.status_code == 204

    def test_delete_log_not_found(self, client, mock_dynamodb):
        """Test delete non-existent habit log."""
        mock_dynamodb.get_habit.return_value = {
            "user_id": "user-1",
            "habit_id": "habit-1",
            "name": "Exercise",
        }
        mock_dynamodb.get_habit_log.return_value = None

        response = client.delete(
            "/api/v1/habits/habit-1/logs/2024-01-15?user_id=user-1"
        )

        assert response.status_code == 404
