#!/bin/bash
# Rolling Update Script - Zero Downtime Deployment
# Usage: ./scripts/rolling-update.sh [service]

set -e

SERVICE=${1:-all}
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=2

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_health() {
    local service=$1
    local port=$2
    local endpoint=$3
    local retries=$HEALTH_CHECK_RETRIES

    log "Checking health of $service on port $port..."

    while [ $retries -gt 0 ]; do
        if curl -sf http://localhost:$port$endpoint > /dev/null 2>&1; then
            log "✅ $service is healthy"
            return 0
        fi
        log "⏳ Waiting for $service to be healthy... ($retries retries left)"
        sleep $HEALTH_CHECK_INTERVAL
        retries=$((retries - 1))
    done

    log "❌ $service failed health check"
    return 1
}

rollback() {
    local service=$1
    log "🔄 Rolling back $service..."
    docker-compose -f $COMPOSE_FILE up -d $service
    log "✅ Rollback completed"
}

deploy_service() {
    local service=$1
    local port=$2
    local health_endpoint=$3

    log "🚀 Deploying $service..."

    # Get current container ID for rollback
    local old_container=$(docker-compose -f $COMPOSE_FILE ps -q $service)

    # Start new container
    docker-compose -f $COMPOSE_FILE up -d --no-deps $service

    # Wait for new container to be healthy
    if check_health $service $port $health_endpoint; then
        log "✅ $service deployed successfully"

        # Remove old container if it exists
        if [ ! -z "$old_container" ]; then
            log "🗑️  Removing old container..."
            docker stop $old_container > /dev/null 2>&1 || true
            docker rm $old_container > /dev/null 2>&1 || true
        fi
        return 0
    else
        log "❌ $service deployment failed, rolling back..."
        rollback $service
        return 1
    fi
}

# Main deployment logic
log "🚀 Starting rolling update for: $SERVICE"

case $SERVICE in
    backend)
        deploy_service backend 8080 /actuator/health
        ;;
    frontend)
        deploy_service frontend 3000 /
        ;;
    backoffice)
        deploy_service backoffice 3001 /
        ;;
    all)
        # Deploy in order: backend → frontend → backoffice
        if deploy_service backend 8080 /actuator/health; then
            deploy_service frontend 3000 /
            deploy_service backoffice 3001 /
        else
            log "❌ Backend deployment failed, skipping frontend/backoffice"
            exit 1
        fi
        ;;
    *)
        log "❌ Unknown service: $SERVICE"
        log "Usage: $0 [backend|frontend|backoffice|all]"
        exit 1
        ;;
esac

log "✅ Rolling update completed successfully"
