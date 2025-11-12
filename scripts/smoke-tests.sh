#!/bin/bash
# Smoke Tests - Verify staging deployment
# Usage: ./scripts/smoke-tests.sh

set -e

STAGING_BACKEND_URL=${STAGING_BACKEND_URL:-http://localhost:8081}
STAGING_FRONTEND_URL=${STAGING_FRONTEND_URL:-http://localhost:3100}
STAGING_BACKOFFICE_URL=${STAGING_BACKOFFICE_URL:-http://localhost:3101}

FAILED_TESTS=0

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    log "Testing $name: $url"

    status=$(curl -s -o /dev/null -w "%{http_code}" $url || echo "000")

    if [ "$status" = "$expected_status" ]; then
        log "✅ $name: OK (HTTP $status)"
        return 0
    else
        log "❌ $name: FAILED (HTTP $status, expected $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

log "🧪 Starting smoke tests on staging environment..."
log ""

# Backend tests
log "=== Backend Tests ==="
test_endpoint "Backend Health" "$STAGING_BACKEND_URL/actuator/health"
test_endpoint "Backend API" "$STAGING_BACKEND_URL/api/coffees"
log ""

# Frontend tests
log "=== Frontend Tests ==="
test_endpoint "Frontend Home" "$STAGING_FRONTEND_URL/"
log ""

# Backoffice tests
log "=== Backoffice Tests ==="
test_endpoint "Backoffice Home" "$STAGING_BACKOFFICE_URL/"
log ""

# Summary
log "=== Test Summary ==="
if [ $FAILED_TESTS -eq 0 ]; then
    log "✅ All smoke tests passed!"
    exit 0
else
    log "❌ $FAILED_TESTS test(s) failed"
    exit 1
fi
