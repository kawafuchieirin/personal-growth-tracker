"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI(
    title="Personal Growth Tracker API",
    description="個人の成長を追跡・可視化するためのAPI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: 本番環境では適切なオリジンを設定
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
