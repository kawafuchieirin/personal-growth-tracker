"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Personal Growth Tracker API",
    description="個人の成長を追跡・可視化するためのAPI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    """ヘルスチェック用エンドポイント."""
    return {"status": "ok", "message": "Personal Growth Tracker API"}


@app.get("/health")
def health() -> dict[str, str]:
    """ヘルスチェック."""
    return {"status": "healthy"}


# Lambda handler
handler = Mangum(app)
