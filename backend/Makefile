.PHONY: help build push deploy run test lint clean

# Variables
PROJECT_NAME := personal-growth-tracker
AWS_REGION := ap-northeast-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_URI := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

# API list
APIS := goals roadmaps skills

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Build commands
build: $(addprefix build-,$(APIS)) ## Build all API images

build-%: ## Build specific API image (e.g., make build-goals)
	docker build -t $(PROJECT_NAME)-$*:latest -f apis/$*/Dockerfile .

# Push commands
push: login $(addprefix push-,$(APIS)) ## Push all API images to ECR

push-%: ## Push specific API image to ECR (e.g., make push-goals)
	docker tag $(PROJECT_NAME)-$*:latest $(ECR_URI)/$(PROJECT_NAME)-$*:latest
	docker push $(ECR_URI)/$(PROJECT_NAME)-$*:latest

# Deploy commands
deploy: push $(addprefix deploy-,$(APIS)) ## Deploy all APIs

deploy-%: ## Deploy specific API (e.g., make deploy-goals)
	aws lambda update-function-code \
		--function-name $(PROJECT_NAME)-$* \
		--image-uri $(ECR_URI)/$(PROJECT_NAME)-$*:latest \
		--region $(AWS_REGION)

# ECR login
login: ## Login to ECR
	aws ecr get-login-password --region $(AWS_REGION) | \
		docker login --username AWS --password-stdin $(ECR_URI)

# Development
run-dev: ## Run development server (goals API)
	cd apis/goals && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

test: ## Run tests
	poetry run pytest tests/ -v

lint: ## Run linter
	poetry run ruff check .
	poetry run mypy .

format: ## Format code
	poetry run ruff check . --fix
	poetry run ruff format .

clean: ## Clean up
	docker-compose down -v 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache __pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# List APIs
list: ## List available APIs
	@echo "Available APIs:"
	@for api in $(APIS); do echo "  - $$api"; done
