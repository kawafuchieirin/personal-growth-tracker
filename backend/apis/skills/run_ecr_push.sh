#!/bin/bash
set -euo pipefail

# =============================================================================
# ECR Push Script for Skills API
# =============================================================================

API_NAME="skills"
PROJECT_NAME="personal-growth-tracker"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"

# Get AWS Account ID if not set
if [[ -z "${AWS_ACCOUNT_ID:-}" ]]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO="${ECR_URI}/${PROJECT_NAME}-${API_NAME}"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

log_info "=== Pushing ${API_NAME} API to ECR ==="

# Create repository if not exists
aws ecr describe-repositories --repository-names "${PROJECT_NAME}-${API_NAME}" --region "${AWS_REGION}" 2>/dev/null || \
aws ecr create-repository --repository-name "${PROJECT_NAME}-${API_NAME}" --region "${AWS_REGION}" --image-scanning-configuration scanOnPush=true

# Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URI}"

# Build
log_info "Building image..."
docker build -t "${PROJECT_NAME}-${API_NAME}:latest" .

# Tag and push
log_info "Pushing to ECR..."
docker tag "${PROJECT_NAME}-${API_NAME}:latest" "${ECR_REPO}:latest"
docker push "${ECR_REPO}:latest"

log_info "Done: ${ECR_REPO}:latest"
