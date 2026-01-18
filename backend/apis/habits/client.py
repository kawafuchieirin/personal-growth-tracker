"""DynamoDB client for Habits API."""

from functools import lru_cache
from typing import Any

import boto3
from boto3.dynamodb.conditions import Key
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Habits API settings."""

    aws_region: str = "ap-northeast-1"
    habits_table_name: str = "personal-growth-tracker-habits"
    habit_logs_table_name: str = "personal-growth-tracker-habit-logs"
    debug: bool = False
    cors_origins: list[str] = ["*"]
    slack_webhook_url: str | None = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


class HabitsClient:
    """DynamoDB client for Habits operations."""

    def __init__(
        self,
        habits_table_name: str | None = None,
        habit_logs_table_name: str | None = None,
    ) -> None:
        """Initialize client with table names."""
        settings = get_settings()
        self._dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
        self._habits_table = self._dynamodb.Table(
            habits_table_name or settings.habits_table_name
        )
        self._habit_logs_table = self._dynamodb.Table(
            habit_logs_table_name or settings.habit_logs_table_name
        )

    # Habits operations
    def get_habit(self, user_id: str, habit_id: str) -> dict[str, Any] | None:
        """Get a single habit by key."""
        response = self._habits_table.get_item(
            Key={"user_id": user_id, "habit_id": habit_id}
        )
        return response.get("Item")

    def put_habit(self, item: dict[str, Any]) -> None:
        """Put a habit into the table."""
        self._habits_table.put_item(Item=item)

    def delete_habit(self, user_id: str, habit_id: str) -> None:
        """Delete a habit by key."""
        self._habits_table.delete_item(Key={"user_id": user_id, "habit_id": habit_id})

    def query_habits(self, user_id: str) -> list[dict[str, Any]]:
        """Query habits by user_id."""
        response = self._habits_table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])

    # Habit logs operations
    def get_habit_log(self, habit_id: str, date: str) -> dict[str, Any] | None:
        """Get a single habit log by key."""
        response = self._habit_logs_table.get_item(
            Key={"habit_id": habit_id, "date": date}
        )
        return response.get("Item")

    def put_habit_log(self, item: dict[str, Any]) -> None:
        """Put a habit log into the table."""
        self._habit_logs_table.put_item(Item=item)

    def delete_habit_log(self, habit_id: str, date: str) -> None:
        """Delete a habit log by key."""
        self._habit_logs_table.delete_item(Key={"habit_id": habit_id, "date": date})

    def query_habit_logs(
        self, habit_id: str, start_date: str | None = None, end_date: str | None = None
    ) -> list[dict[str, Any]]:
        """Query habit logs by habit_id with optional date range."""
        key_condition = Key("habit_id").eq(habit_id)
        if start_date and end_date:
            key_condition = key_condition & Key("date").between(start_date, end_date)
        elif start_date:
            key_condition = key_condition & Key("date").gte(start_date)
        elif end_date:
            key_condition = key_condition & Key("date").lte(end_date)

        response = self._habit_logs_table.query(KeyConditionExpression=key_condition)
        return response.get("Items", [])

    def query_habit_logs_by_user(
        self, user_id: str, start_date: str | None = None, end_date: str | None = None
    ) -> list[dict[str, Any]]:
        """Query habit logs by user_id using GSI."""
        key_condition = Key("user_id").eq(user_id)
        if start_date and end_date:
            key_condition = key_condition & Key("date").between(start_date, end_date)
        elif start_date:
            key_condition = key_condition & Key("date").gte(start_date)
        elif end_date:
            key_condition = key_condition & Key("date").lte(end_date)

        response = self._habit_logs_table.query(
            IndexName="user_id-date-index",
            KeyConditionExpression=key_condition,
        )
        return response.get("Items", [])

    def batch_delete_habit_logs(self, habit_id: str) -> None:
        """Delete all habit logs for a habit."""
        logs = self.query_habit_logs(habit_id)
        with self._habit_logs_table.batch_writer() as batch:
            for log in logs:
                batch.delete_item(Key={"habit_id": habit_id, "date": log["date"]})
