# Goals API

目標管理API - Personal Growth Trackerの一部

## 概要

ユーザーの目標を作成・取得・更新・削除するためのREST API。

## エンドポイント

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/goals | 目標一覧取得 |
| GET | /api/v1/goals/{goal_id} | 目標詳細取得 |
| POST | /api/v1/goals | 目標作成 |
| PUT | /api/v1/goals/{goal_id} | 目標更新 |
| DELETE | /api/v1/goals/{goal_id} | 目標削除 |

## 開発

```bash
# 依存関係インストール
make install

# 開発サーバー起動
make dev

# テスト実行
make test

# リント・フォーマット
make lint
make format
```

## ビルド・デプロイ

```bash
# Dockerイメージビルド
make build

# ECRへプッシュ
make push

# Lambdaへデプロイ
make deploy
```

## ディレクトリ構造

```
goals/
├── __init__.py
├── api_handler.py      # APIハンドラー
├── main.py             # Lambdaエントリーポイント
├── models.py           # Pydanticモデル
├── client.py           # DynamoDBクライアント
├── conf/
│   └── info.yaml       # 設定ファイル
├── tests/
│   └── ...             # テストファイル
└── terraform/
    └── ...             # Terraformファイル
```
