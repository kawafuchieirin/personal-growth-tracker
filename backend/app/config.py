"""Application configuration using pydantic-settings."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Environment
    environment: Literal["local", "dev", "prod"] = "local"

    # AWS Settings
    aws_region: str = "ap-northeast-1"
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None

    # DynamoDB Settings
    dynamodb_endpoint_url: str | None = None
    goals_table_name: str = "goals"
    roadmaps_table_name: str = "roadmaps"
    skills_table_name: str = "skills"

    # CORS Settings
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def is_local(self) -> bool:
        """Check if running in local environment."""
        return self.environment == "local"

    @property
    def dynamodb_config(self) -> dict:
        """Get DynamoDB client configuration."""
        config: dict = {"region_name": self.aws_region}

        if self.dynamodb_endpoint_url:
            config["endpoint_url"] = self.dynamodb_endpoint_url

        if self.aws_access_key_id and self.aws_secret_access_key:
            config["aws_access_key_id"] = self.aws_access_key_id
            config["aws_secret_access_key"] = self.aws_secret_access_key

        return config


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
