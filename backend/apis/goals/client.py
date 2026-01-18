"""DynamoDB client for Goals API."""

from typing import Any
import boto3
from boto3.dynamodb.conditions import Key
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Goals API settings."""

    aws_region: str = "ap-northeast-1"
    goals_table_name: str = "personal-growth-tracker-goals"
    debug: bool = False
    cors_origins: list[str] = ["*"]

    class Config:
        env_prefix = ""
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


class GoalsClient:
    """DynamoDB client for Goals operations."""

    def __init__(self, table_name: str | None = None) -> None:
        """Initialize client with table name."""
        settings = get_settings()
        self._dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
        self._table = self._dynamodb.Table(table_name or settings.goals_table_name)

    def get_item(self, key: dict[str, Any]) -> dict[str, Any] | None:
        """Get a single item by key."""
        response = self._table.get_item(Key=key)
        return response.get("Item")

    def put_item(self, item: dict[str, Any]) -> None:
        """Put an item into the table."""
        self._table.put_item(Item=item)

    def delete_item(self, key: dict[str, Any]) -> None:
        """Delete an item by key."""
        self._table.delete_item(Key=key)

    def query(self, key_name: str, key_value: str) -> list[dict[str, Any]]:
        """Query items by partition key."""
        response = self._table.query(
            KeyConditionExpression=Key(key_name).eq(key_value)
        )
        return response.get("Items", [])

    def scan(self) -> list[dict[str, Any]]:
        """Scan all items in the table."""
        response = self._table.scan()
        return response.get("Items", [])
