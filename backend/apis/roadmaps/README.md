# Roadmaps API

ロードマップ・マイルストーン管理API - Personal Growth Trackerの一部

## 概要

目標に紐づくマイルストーンを作成・取得・更新・削除するためのREST API。

## エンドポイント

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/roadmaps | マイルストーン一覧取得 |
| GET | /api/v1/roadmaps/{milestone_id} | マイルストーン詳細取得 |
| POST | /api/v1/roadmaps | マイルストーン作成 |
| PUT | /api/v1/roadmaps/{milestone_id} | マイルストーン更新 |
| DELETE | /api/v1/roadmaps/{milestone_id} | マイルストーン削除 |

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
roadmaps/
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
