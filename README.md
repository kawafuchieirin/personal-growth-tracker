# Personal Growth Tracker

個人の成長を追跡・可視化するためのWebアプリケーション

## 機能概要

- **ダッシュボード**: 目標と進捗の一覧表示
- **目標管理**: 目標の作成・確認・編集
- **ロードマップ**: 目標を細分化したマイルストーン管理
- **能力可視化**: スキルや成長をグラフ・チャートで表示

## 技術スタック

### Backend
- **言語**: Python 3.14+
- **フレームワーク**: FastAPI
- **パッケージ管理**: Poetry
- **データベース**: Amazon DynamoDB

### Frontend
- **フレームワーク**: React 19+ (TypeScript)
- **ビルドツール**: Vite
- **スタイリング**: TBD

### Infrastructure
- **クラウド**: AWS
- **IaC**: Terraform
- **コンピューティング**: AWS Lambda + API Gateway
- **ストレージ**: DynamoDB
- **フロントエンド配信**: S3 + CloudFront

### DevOps
- **CI/CD**: GitHub Actions
- **コード品質**: pre-commit, Ruff, ESLint, Prettier

## プロジェクト構成

```
personal-growth-tracker/
├── backend/                 # FastAPI アプリケーション
│   ├── app/
│   │   ├── api/            # APIエンドポイント
│   │   ├── models/         # Pydanticモデル
│   │   ├── services/       # ビジネスロジック
│   │   └── main.py         # エントリーポイント
│   ├── tests/              # バックエンドテスト
│   └── pyproject.toml      # Poetry設定
├── frontend/               # React アプリケーション
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API通信
│   │   └── types/          # TypeScript型定義
│   ├── package.json
│   └── vite.config.ts
├── infrastructure/         # Terraform設定
│   ├── modules/
│   │   ├── lambda/
│   │   ├── api-gateway/
│   │   ├── dynamodb/
│   │   └── cloudfront/
│   ├── environments/
│   │   ├── dev/
│   │   └── prod/
│   └── main.tf
├── .github/
│   └── workflows/          # GitHub Actions
├── .pre-commit-config.yaml
└── README.md
```

## セットアップ

### 前提条件

- Python 3.14+
- Poetry
- Node.js 22+
- AWS CLI (設定済み)
- Terraform 1.5+

### Backend

```bash
cd backend
poetry install

# 開発サーバー起動
poetry run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# 開発サーバー起動
npm run dev
```

### Infrastructure

```bash
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

### pre-commit

```bash
pip install pre-commit
pre-commit install
```

## 開発コマンド

### Backend

| コマンド | 説明 |
|---------|------|
| `poetry run uvicorn app.main:app --reload` | 開発サーバー起動 |
| `poetry run pytest` | テスト実行 |
| `poetry run pytest --cov=app` | カバレッジ付きテスト |
| `poetry run ruff check .` | リント実行 |
| `poetry run ruff format .` | フォーマット |
| `poetry run mypy app` | 型チェック |

### Frontend

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run test` | テスト実行 |
| `npm run lint` | リント実行 |

### Infrastructure

| コマンド | 説明 |
|---------|------|
| `terraform init` | 初期化 |
| `terraform plan` | 変更プレビュー |
| `terraform apply` | デプロイ |
| `terraform destroy` | リソース削除 |

## ライセンス

Private
