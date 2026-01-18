"""Tests for Roadmaps API DynamoDB client."""

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
            TableName="personal-growth-tracker-roadmaps",
            KeySchema=[
                {"AttributeName": "goal_id", "KeyType": "HASH"},
                {"AttributeName": "milestone_id", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "goal_id", "AttributeType": "S"},
                {"AttributeName": "milestone_id", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        yield table


class TestRoadmapsClient:
    """Tests for RoadmapsClient."""

    @mock_aws
    def test_put_and_get_item(self, dynamodb_table):
        """Test putting and getting an item."""
        from client import RoadmapsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.roadmaps_table_name = (
                "personal-growth-tracker-roadmaps"
            )

            client = RoadmapsClient()
            item = {
                "goal_id": "goal-1",
                "milestone_id": "milestone-1",
                "title": "Setup environment",
            }
            client.put_item(item)

            result = client.get_item(
                {"goal_id": "goal-1", "milestone_id": "milestone-1"}
            )
            assert result["title"] == "Setup environment"

    @mock_aws
    def test_delete_item(self, dynamodb_table):
        """Test deleting an item."""
        from client import RoadmapsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.roadmaps_table_name = (
                "personal-growth-tracker-roadmaps"
            )

            client = RoadmapsClient()
            item = {
                "goal_id": "goal-1",
                "milestone_id": "milestone-1",
                "title": "Setup environment",
            }
            client.put_item(item)
            client.delete_item({"goal_id": "goal-1", "milestone_id": "milestone-1"})

            result = client.get_item(
                {"goal_id": "goal-1", "milestone_id": "milestone-1"}
            )
            assert result is None

    @mock_aws
    def test_query(self, dynamodb_table):
        """Test querying items by partition key."""
        from client import RoadmapsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.roadmaps_table_name = (
                "personal-growth-tracker-roadmaps"
            )

            client = RoadmapsClient()
            client.put_item(
                {"goal_id": "goal-1", "milestone_id": "milestone-1", "title": "Step 1"}
            )
            client.put_item(
                {"goal_id": "goal-1", "milestone_id": "milestone-2", "title": "Step 2"}
            )
            client.put_item(
                {"goal_id": "goal-2", "milestone_id": "milestone-3", "title": "Step 3"}
            )

            results = client.query("goal_id", "goal-1")
            assert len(results) == 2
