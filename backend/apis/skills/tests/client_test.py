"""Tests for Skills API DynamoDB client."""

import pytest
from unittest.mock import MagicMock, patch
import boto3
from moto import mock_aws


@pytest.fixture
def dynamodb_table():
    """Create mock DynamoDB table."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1")
        table = dynamodb.create_table(
            TableName="personal-growth-tracker-skills",
            KeySchema=[
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "skill_id", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "skill_id", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        yield table


class TestSkillsClient:
    """Tests for SkillsClient."""

    @mock_aws
    def test_put_and_get_item(self, dynamodb_table):
        """Test putting and getting an item."""
        from client import SkillsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.skills_table_name = "personal-growth-tracker-skills"

            client = SkillsClient()
            item = {
                "user_id": "user-1",
                "skill_id": "skill-1",
                "name": "Python",
            }
            client.put_item(item)

            result = client.get_item({"user_id": "user-1", "skill_id": "skill-1"})
            assert result["name"] == "Python"

    @mock_aws
    def test_delete_item(self, dynamodb_table):
        """Test deleting an item."""
        from client import SkillsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.skills_table_name = "personal-growth-tracker-skills"

            client = SkillsClient()
            item = {
                "user_id": "user-1",
                "skill_id": "skill-1",
                "name": "Python",
            }
            client.put_item(item)
            client.delete_item({"user_id": "user-1", "skill_id": "skill-1"})

            result = client.get_item({"user_id": "user-1", "skill_id": "skill-1"})
            assert result is None

    @mock_aws
    def test_query(self, dynamodb_table):
        """Test querying items by partition key."""
        from client import SkillsClient

        with patch("client.get_settings") as mock_settings:
            mock_settings.return_value.aws_region = "ap-northeast-1"
            mock_settings.return_value.skills_table_name = "personal-growth-tracker-skills"

            client = SkillsClient()
            client.put_item({"user_id": "user-1", "skill_id": "skill-1", "name": "Python"})
            client.put_item({"user_id": "user-1", "skill_id": "skill-2", "name": "JavaScript"})
            client.put_item({"user_id": "user-2", "skill_id": "skill-3", "name": "Go"})

            results = client.query("user_id", "user-1")
            assert len(results) == 2
