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
- **スタイリング**: CSS Modules
- **E2Eテスト**: Playwright

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
├── backend/
│   └── apis/                    # マイクロサービス構成
│       ├── goals/               # 目標管理API
│       │   ├── api_handler.py   # APIエンドポイント
│       │   ├── client.py        # DynamoDBクライアント
│       │   ├── main.py          # FastAPIエントリーポイント
│       │   ├── models.py        # Pydanticモデル
│       │   ├── tests/           # ユニットテスト
│       │   ├── terraform/       # API専用インフラ
│       │   └── pyproject.toml
│       ├── roadmaps/            # ロードマップAPI（同構成）
│       └── skills/              # スキル管理API（同構成）
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # 共通UI（Button, Card, Modal等）
│   │   │   ├── features/        # 機能別コンポーネント
│   │   │   │   ├── goals/       # GoalCard, GoalForm
│   │   │   │   ├── roadmaps/    # MilestoneCard, MilestoneTimeline
│   │   │   │   └── skills/      # SkillCard, SkillChart, SkillForm
│   │   │   └── layout/          # Layout, Header, Sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard/       # ダッシュボード
│   │   │   ├── Goals/           # 目標一覧・詳細
│   │   │   └── Skills/          # スキル管理
│   │   ├── hooks/               # useGoals, useSkills, useRoadmaps
│   │   ├── services/            # API通信層
│   │   ├── contexts/            # React Context
│   │   ├── types/               # TypeScript型定義
│   │   ├── utils/               # ユーティリティ関数
│   │   └── styles/              # CSS変数
│   ├── e2e/                     # Playwright E2Eテスト
│   ├── package.json
│   └── vite.config.ts
├── infrastructure/
│   ├── modules/
│   │   ├── api-gateway/         # API Gateway設定
│   │   ├── cloudfront/          # CloudFront CDN
│   │   ├── dynamodb/            # DynamoDBテーブル
│   │   ├── github-oidc/         # GitHub Actions OIDC認証
│   │   └── lambda/              # Lambda関数
│   └── main.tf
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI（テスト・リント）
│       └── deploy.yml           # デプロイ（OIDC認証）
├── .claude/                     # Claude Code設定
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

各APIは独立したマイクロサービスとして構成されています。

```bash
# Goals API
cd backend/apis/goals
poetry install
poetry run uvicorn main:app --reload --port 8001

# Skills API
cd backend/apis/skills
poetry install
poetry run uvicorn main:app --reload --port 8002

# Roadmaps API
cd backend/apis/roadmaps
poetry install
poetry run uvicorn main:app --reload --port 8003
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

### Backend（各API共通）

```bash
cd backend/apis/{goals|skills|roadmaps}
```

| コマンド | 説明 |
|---------|------|
| `poetry run uvicorn main:app --reload` | 開発サーバー起動 |
| `poetry run pytest` | テスト実行 |
| `poetry run pytest --cov` | カバレッジ付きテスト |
| `poetry run ruff check .` | リント実行 |
| `poetry run ruff format .` | フォーマット |
| `poetry run mypy .` | 型チェック |

### Frontend

```bash
cd frontend
```

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (localhost:3000) |
| `npm run build` | プロダクションビルド |
| `npm run test` | ユニットテスト実行 |
| `npm run test:e2e` | E2Eテスト実行 (Playwright) |
| `npm run lint` | ESLint実行 |
| `npm run typecheck` | TypeScript型チェック |
| `npm run format` | Prettierフォーマット |

### Infrastructure

```bash
cd infrastructure
```

| コマンド | 説明 |
|---------|------|
| `terraform init` | 初期化 |
| `terraform plan` | 変更プレビュー |
| `terraform apply` | デプロイ |
| `terraform destroy` | リソース削除 |


## デプロイ先

- **フロントエンド**: https://d1zi7fgixextim.cloudfront.net
- **API**: https://ttoh4joopk.execute-api.ap-northeast-1.amazonaws.com/api/v1

## ライセンス

Private
