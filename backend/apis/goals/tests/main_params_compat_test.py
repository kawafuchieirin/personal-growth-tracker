"""Tests for main module parameter compatibility."""

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


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        """Test health check returns healthy status."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["api"] == "goals"


class TestAPIRoutes:
    """Tests for API route configuration."""

    def test_api_prefix(self, client, mock_dynamodb):
        """Test API routes have correct prefix."""
        mock_dynamodb.query.return_value = []

        response = client.get("/api/v1/goals?user_id=test")

        assert response.status_code == 200

    def test_invalid_route(self, client):
        """Test invalid route returns 404."""
        response = client.get("/invalid")

        assert response.status_code == 404


class TestCORS:
    """Tests for CORS configuration."""

    def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = client.options(
            "/api/v1/goals",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        assert "access-control-allow-origin" in response.headers
