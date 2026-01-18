"""Tests for Goals API DynamoDB client."""

from unittest.mock import patch

import boto3
import pytest
from moto import mock_aws


@pytest.fixture
def dynamodb_table():
    """Create mock DynamoDB table."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1")
        table = dynamodb.create_table(
            TableName="personal-growth-tracker-goals",
            KeySchema=[
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "goal_id", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "goal_id", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        yield table


class TestGoalsClient:
    """Tests for GoalsClient."""

    @mock_aws
    def test_put_and_get_item(self, dynamodb_table):
        """Test putting and getting an item."""
        from client import GoalsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.goals_table_name = (
                "personal-growth-tracker-goals"
            )

            client = GoalsClient()
            item = {
                "user_id": "user-1",
                "goal_id": "goal-1",
                "title": "Learn Python",
            }
            client.put_item(item)

            result = client.get_item({"user_id": "user-1", "goal_id": "goal-1"})
            assert result["title"] == "Learn Python"

    @mock_aws
    def test_delete_item(self, dynamodb_table):
        """Test deleting an item."""
        from client import GoalsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.goals_table_name = (
                "personal-growth-tracker-goals"
            )

            client = GoalsClient()
            item = {
                "user_id": "user-1",
                "goal_id": "goal-1",
                "title": "Learn Python",
            }
            client.put_item(item)
            client.delete_item({"user_id": "user-1", "goal_id": "goal-1"})

            result = client.get_item({"user_id": "user-1", "goal_id": "goal-1"})
            assert result is None

    @mock_aws
    def test_query(self, dynamodb_table):
        """Test querying items by partition key."""
        from client import GoalsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.goals_table_name = (
                "personal-growth-tracker-goals"
            )

            client = GoalsClient()
            client.put_item(
                {"user_id": "user-1", "goal_id": "goal-1", "title": "Goal 1"}
            )
            client.put_item(
                {"user_id": "user-1", "goal_id": "goal-2", "title": "Goal 2"}
            )
            client.put_item(
                {"user_id": "user-2", "goal_id": "goal-3", "title": "Goal 3"}
            )

            results = client.query("user_id", "user-1")
            assert len(results) == 2
