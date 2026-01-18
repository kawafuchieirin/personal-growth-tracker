.PHONY: help install dev test lint format build push deploy clean

# Variables
API_NAME := skills
PROJECT_NAME := personal-growth-tracker
AWS_REGION := ap-northeast-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_URI := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	poetry install

dev: ## Run development server
	poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8002

test: ## Run tests
	poetry run pytest tests/ -v

test-cov: ## Run tests with coverage
	poetry run pytest tests/ -v --cov=. --cov-report=html

lint: ## Run linter
	poetry run ruff check .
	poetry run mypy .

format: ## Format code
	poetry run ruff check . --fix
	poetry run ruff format .

build: ## Build Docker image
	docker build -t $(PROJECT_NAME)-$(API_NAME):latest .

push: ## Push to ECR
	./run_ecr_push.sh

deploy: push ## Deploy to Lambda
	aws lambda update-function-code \
		--function-name $(PROJECT_NAME)-$(API_NAME) \
		--image-uri $(ECR_URI)/$(PROJECT_NAME)-$(API_NAME):latest \
		--region $(AWS_REGION)

docker-up: ## Start Docker Compose
	docker-compose up -d

docker-down: ## Stop Docker Compose
	docker-compose down

clean: ## Clean up
	rm -rf .pytest_cache .mypy_cache .ruff_cache __pycache__ .venv htmlcov .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
