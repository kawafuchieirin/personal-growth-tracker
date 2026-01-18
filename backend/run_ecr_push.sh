#!/bin/bash
set -euo pipefail

# =============================================================================
# ECR Push Script for Multiple APIs
# =============================================================================
# Usage:
#   ./run_ecr_push.sh <api_name>    # Push specific API
#   ./run_ecr_push.sh --all         # Push all APIs
#   ./run_ecr_push.sh --list        # List available APIs
# =============================================================================

PROJECT_NAME="personal-growth-tracker"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
APIS=("goals" "roadmaps" "skills")

# Get AWS Account ID if not set
if [[ -z "${AWS_ACCOUNT_ID:-}" ]]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

push_api() {
    local api=$1
    local ecr_repo="${ECR_URI}/${PROJECT_NAME}-${api}"

    log_info "=== Pushing ${api} API ==="

    # Create repository if not exists
    aws ecr describe-repositories --repository-names "${PROJECT_NAME}-${api}" --region "${AWS_REGION}" 2>/dev/null || \
    aws ecr create-repository --repository-name "${PROJECT_NAME}-${api}" --region "${AWS_REGION}" --image-scanning-configuration scanOnPush=true

    # Build
    log_info "Building image..."
    docker build -t "${PROJECT_NAME}-${api}:latest" -f "apis/${api}/Dockerfile" .

    # Tag and push
    log_info "Pushing to ECR..."
    docker tag "${PROJECT_NAME}-${api}:latest" "${ecr_repo}:latest"
    docker push "${ecr_repo}:latest"

    log_info "Done: ${ecr_repo}:latest"
}

push_all() {
    # Login to ECR
    log_info "Logging in to ECR..."
    aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URI}"

    for api in "${APIS[@]}"; do
        push_api "$api"
    done
}

list_apis() {
    echo "Available APIs:"
    for api in "${APIS[@]}"; do
        echo "  - $api"
    done
}

# Main
case "${1:-}" in
    --all)
        push_all
        ;;
    --list)
        list_apis
        ;;
    --help|-h|"")
        echo "Usage: $0 <api_name|--all|--list>"
        echo ""
        echo "Options:"
        echo "  <api_name>  Push specific API (goals, roadmaps, skills)"
        echo "  --all       Push all APIs"
        echo "  --list      List available APIs"
        exit 0
        ;;
    *)
        if [[ " ${APIS[*]} " =~ " $1 " ]]; then
            aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URI}"
            push_api "$1"
        else
            log_error "Unknown API: $1"
            list_apis
            exit 1
        fi
        ;;
esac
