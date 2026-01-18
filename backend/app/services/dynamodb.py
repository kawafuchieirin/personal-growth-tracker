"""DynamoDB service layer for database operations."""

from functools import lru_cache
from typing import Any

import boto3
from boto3.dynamodb.conditions import Key
from mypy_boto3_dynamodb import DynamoDBServiceResource
from mypy_boto3_dynamodb.service_resource import Table

from app.config import Settings, get_settings


class DynamoDBService:
    """Service class for DynamoDB operations."""

    def __init__(self, settings: Settings | None = None) -> None:
        """Initialize DynamoDB service."""
        self._settings = settings or get_settings()
        self._resource: DynamoDBServiceResource | None = None

    @property
    def resource(self) -> DynamoDBServiceResource:
        """Get DynamoDB resource (lazy initialization)."""
        if self._resource is None:
            self._resource = boto3.resource(
                "dynamodb",
                **self._settings.dynamodb_config,
            )
        return self._resource

    def _get_table(self, table_name: str) -> Table:
        """Get a DynamoDB table by name."""
        return self.resource.Table(table_name)

    @property
    def goals_table(self) -> Table:
        """Get goals table."""
        return self._get_table(self._settings.goals_table_name)

    @property
    def roadmaps_table(self) -> Table:
        """Get roadmaps table."""
        return self._get_table(self._settings.roadmaps_table_name)

    @property
    def skills_table(self) -> Table:
        """Get skills table."""
        return self._get_table(self._settings.skills_table_name)

    # Goals operations
    def get_goal(self, user_id: str, goal_id: str) -> dict[str, Any] | None:
        """Get a goal by user_id and goal_id."""
        response = self.goals_table.get_item(
            Key={"user_id": user_id, "goal_id": goal_id}
        )
        return response.get("Item")

    def get_goals_by_user(self, user_id: str) -> list[dict[str, Any]]:
        """Get all goals for a user."""
        response = self.goals_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])

    def put_goal(self, item: dict[str, Any]) -> None:
        """Create or update a goal."""
        self.goals_table.put_item(Item=item)

    def delete_goal(self, user_id: str, goal_id: str) -> None:
        """Delete a goal."""
        self.goals_table.delete_item(Key={"user_id": user_id, "goal_id": goal_id})

    # Roadmaps operations
    def get_milestone(
        self, goal_id: str, milestone_id: str
    ) -> dict[str, Any] | None:
        """Get a milestone by goal_id and milestone_id."""
        response = self.roadmaps_table.get_item(
            Key={"goal_id": goal_id, "milestone_id": milestone_id}
        )
        return response.get("Item")

    def get_milestones_by_goal(self, goal_id: str) -> list[dict[str, Any]]:
        """Get all milestones for a goal."""
        response = self.roadmaps_table.query(
            KeyConditionExpression=Key("goal_id").eq(goal_id)
        )
        return response.get("Items", [])

    def put_milestone(self, item: dict[str, Any]) -> None:
        """Create or update a milestone."""
        self.roadmaps_table.put_item(Item=item)

    def delete_milestone(self, goal_id: str, milestone_id: str) -> None:
        """Delete a milestone."""
        self.roadmaps_table.delete_item(
            Key={"goal_id": goal_id, "milestone_id": milestone_id}
        )

    # Skills operations
    def get_skill(self, user_id: str, skill_id: str) -> dict[str, Any] | None:
        """Get a skill by user_id and skill_id."""
        response = self.skills_table.get_item(
            Key={"user_id": user_id, "skill_id": skill_id}
        )
        return response.get("Item")

    def get_skills_by_user(self, user_id: str) -> list[dict[str, Any]]:
        """Get all skills for a user."""
        response = self.skills_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])

    def put_skill(self, item: dict[str, Any]) -> None:
        """Create or update a skill."""
        self.skills_table.put_item(Item=item)

    def delete_skill(self, user_id: str, skill_id: str) -> None:
        """Delete a skill."""
        self.skills_table.delete_item(Key={"user_id": user_id, "skill_id": skill_id})


@lru_cache
def get_dynamodb_service() -> DynamoDBService:
    """Get cached DynamoDB service instance."""
    return DynamoDBService()
