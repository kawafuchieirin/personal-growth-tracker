#!/bin/bash
set -euo pipefail

# =============================================================================
# Docker Compose Runner for Roadmaps API
# =============================================================================

ACTION="${1:-up}"

case "$ACTION" in
    up)
        echo "Starting Roadmaps API..."
        docker-compose up -d
        echo "Roadmaps API is running at http://localhost:8003"
        echo "DynamoDB Local is running at http://localhost:8000"
        ;;
    down)
        echo "Stopping Roadmaps API..."
        docker-compose down
        ;;
    logs)
        docker-compose logs -f
        ;;
    restart)
        docker-compose restart
        ;;
    *)
        echo "Usage: $0 {up|down|logs|restart}"
        exit 1
        ;;
esac
