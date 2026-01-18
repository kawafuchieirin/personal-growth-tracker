.PHONY: help install dev test lint format build clean
.PHONY: backend-install backend-dev backend-test backend-lint backend-format
.PHONY: frontend-install frontend-dev frontend-test frontend-lint frontend-format frontend-build
.PHONY: infra-init infra-plan infra-apply infra-destroy
.PHONY: docker-up docker-down e2e

# Variables
PROJECT_NAME := personal-growth-tracker
AWS_REGION := ap-northeast-1

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

# =====================
# Full Project Commands
# =====================

install: backend-install frontend-install ## Install all dependencies

dev: ## Run all development servers (requires multiple terminals)
	@echo "Run the following commands in separate terminals:"
	@echo "  make backend-dev"
	@echo "  make frontend-dev"

test: backend-test frontend-test ## Run all tests

lint: backend-lint frontend-lint ## Run all linters

format: backend-format frontend-format ## Format all code

clean: backend-clean frontend-clean ## Clean all build artifacts

# =====================
# Backend Commands
# =====================

backend-install: ## Install backend dependencies
	cd backend && poetry install

backend-dev: ## Run backend development server (goals API)
	cd backend/apis/goals && PYTHONPATH=. poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

backend-dev-skills: ## Run skills API development server
	cd backend/apis/skills && PYTHONPATH=. poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8001

backend-dev-roadmaps: ## Run roadmaps API development server
	cd backend/apis/roadmaps && PYTHONPATH=. poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8002

backend-test: ## Run backend tests
	cd backend && PYTHONPATH=apis/goals poetry run pytest apis/goals/tests/ -v
	cd backend && PYTHONPATH=apis/skills poetry run pytest apis/skills/tests/ -v
	cd backend && PYTHONPATH=apis/roadmaps poetry run pytest apis/roadmaps/tests/ -v

backend-test-goals: ## Run goals API tests
	cd backend && PYTHONPATH=apis/goals poetry run pytest apis/goals/tests/ -v

backend-test-skills: ## Run skills API tests
	cd backend && PYTHONPATH=apis/skills poetry run pytest apis/skills/tests/ -v

backend-test-roadmaps: ## Run roadmaps API tests
	cd backend && PYTHONPATH=apis/roadmaps poetry run pytest apis/roadmaps/tests/ -v

backend-lint: ## Run backend linter
	cd backend && poetry run ruff check apis/
	cd backend && poetry run mypy apis/ --ignore-missing-imports

backend-format: ## Format backend code
	cd backend && poetry run ruff check apis/ --fix
	cd backend && poetry run ruff format apis/

backend-clean: ## Clean backend build artifacts
	cd backend && rm -rf .pytest_cache .mypy_cache .ruff_cache __pycache__ .coverage htmlcov
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find backend -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true

# =====================
# Frontend Commands
# =====================

frontend-install: ## Install frontend dependencies
	cd frontend && npm install

frontend-dev: ## Run frontend development server
	cd frontend && npm run dev

frontend-test: ## Run frontend tests
	cd frontend && npm run test -- --run

frontend-test-watch: ## Run frontend tests in watch mode
	cd frontend && npm run test

frontend-lint: ## Run frontend linter
	cd frontend && npm run lint

frontend-format: ## Format frontend code
	cd frontend && npm run format

frontend-build: ## Build frontend for production
	cd frontend && npm run build

frontend-typecheck: ## Run frontend type check
	cd frontend && npm run typecheck

frontend-clean: ## Clean frontend build artifacts
	cd frontend && rm -rf dist node_modules/.cache

# =====================
# E2E Test Commands
# =====================

e2e: ## Run E2E tests
	cd frontend && npm run test:e2e

e2e-ui: ## Run E2E tests with UI
	cd frontend && npm run test:e2e:ui

e2e-report: ## Show E2E test report
	cd frontend && npm run test:e2e:report

# =====================
# Infrastructure Commands
# =====================

infra-init: ## Initialize Terraform
	cd infrastructure && terraform init

infra-plan: ## Plan Terraform changes
	cd infrastructure && terraform plan

infra-apply: ## Apply Terraform changes
	cd infrastructure && terraform apply

infra-destroy: ## Destroy Terraform resources
	cd infrastructure && terraform destroy

infra-fmt: ## Format Terraform files
	cd infrastructure && terraform fmt -recursive

infra-validate: ## Validate Terraform configuration
	cd infrastructure && terraform validate

# =====================
# Docker Commands
# =====================

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## Show Docker Compose logs
	docker-compose logs -f

docker-build: ## Build all Docker images
	cd backend && make build

docker-clean: ## Remove all Docker containers and images
	docker-compose down -v --rmi local 2>/dev/null || true

# =====================
# CI Commands
# =====================

ci: lint test ## Run CI checks locally

pre-commit: ## Run pre-commit hooks
	pre-commit run --all-files

# =====================
# Setup Commands
# =====================

setup: install pre-commit-install ## Setup development environment

pre-commit-install: ## Install pre-commit hooks
	pre-commit install
