# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Personal Growth Tracker - 個人の成長を追跡・可視化するためのWebアプリケーション

### 機能

- ダッシュボード: 目標と進捗の一覧表示
- 目標管理: 目標の作成・確認・編集
- ロードマップ: 目標を細分化したマイルストーン管理
- 能力可視化: スキルや成長をグラフ・チャートで表示

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Backend | Python 3.14+, FastAPI, Poetry, Mangum (Lambda adapter) |
| Frontend | React 19+, TypeScript, Vite |
| Database | Amazon DynamoDB |
| Infrastructure | AWS (Lambda, API Gateway, S3, CloudFront), Terraform |
| CI/CD | GitHub Actions |
| コード品質 | Ruff, mypy, ESLint, Prettier, pre-commit |
| E2Eテスト | Playwright |
| MCP | Playwright MCP Server |

## 開発コマンド

### Backend (`backend/`)

```bash
# 依存関係インストール
poetry install

# 開発サーバー
poetry run uvicorn app.main:app --reload

# テスト
poetry run pytest                      # 全テスト
poetry run pytest tests/test_main.py::test_root  # 単一テスト
poetry run pytest --cov=app            # カバレッジ付き

# リント・フォーマット
poetry run ruff check .                # リント
poetry run ruff check . --fix          # リント（自動修正）
poetry run ruff format .               # フォーマット
poetry run mypy app                    # 型チェック
```

### Frontend (`frontend/`)

```bash
npm install               # 依存関係インストール
npm run dev               # 開発サーバー (localhost:3000)
npm run build             # プロダクションビルド
npm run test              # テスト
npm run test -- --run     # テスト（ウォッチなし）
npm run lint              # ESLint
npm run typecheck         # TypeScript型チェック
npm run format            # Prettier

# E2Eテスト (Playwright)
npm run test:e2e          # E2Eテスト実行
npm run test:e2e:ui       # UIモードで実行
npm run test:e2e:report   # レポート表示
```

### Infrastructure (`infrastructure/`)

```bash
# dev環境
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply

# prod環境
cd infrastructure/environments/prod
terraform init
terraform plan
terraform apply
```

### pre-commit

```bash
pre-commit install        # フックのインストール
pre-commit run --all-files  # 全ファイルに対して実行
```

## アーキテクチャ

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CloudFront  │────▶│     S3      │     │  DynamoDB   │
│   (CDN)     │     │ (Frontend)  │     │  (Tables)   │
└─────────────┘     └─────────────┘     └──────▲──────┘
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────┴──────┐
│   Client    │────▶│ API Gateway │────▶│   Lambda    │
│  (Browser)  │     │   (HTTP)    │     │  (FastAPI)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### DynamoDBテーブル

- `goals`: ユーザーの目標 (PK: user_id, SK: goal_id)
- `roadmaps`: マイルストーン (PK: goal_id, SK: milestone_id)
- `skills`: スキル・能力 (PK: user_id, SK: skill_id)

## ディレクトリ構造

- `backend/app/api/` - APIエンドポイント
- `backend/app/models/` - Pydanticモデル
- `backend/app/services/` - ビジネスロジック
- `frontend/src/pages/` - ページコンポーネント
- `frontend/src/components/` - 共通UIコンポーネント
- `frontend/src/hooks/` - カスタムフック
- `frontend/src/services/` - API通信
- `infrastructure/modules/` - Terraformモジュール

## MCP設定

`.mcp.json` でPlaywright MCPサーバーを設定済み。ブラウザ操作やE2Eテストの自動化に利用可能。

## 専門エージェント

`.claude/agents/` に専門エージェントを配置:

- `frontend.md` - フロントエンド開発
- `backend.md` - バックエンド開発
- `tester.md` - テスト・QA
- `pm.md` - プロジェクト管理
- `devops.md` - DevOps・インフラ
- `designer.md` - UI/UXデザイン
- `security.md` - セキュリティ
