#!/bin/bash

# ========================================
# Sipzy Docker Helper Script
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker installed"

    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose installed"

    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        print_warning ".env file not found, copying from .env.example"
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        print_success ".env file created"
    fi
}

# Start services
start_services() {
    print_header "Starting Services"

    if [ "$1" == "dev" ]; then
        docker compose --profile dev up -d
        print_success "All services started (including pgAdmin)"
    elif [ -n "$1" ]; then
        docker compose up "$1" -d
        print_success "$1 service started"
    else
        docker compose up -d
        print_success "All services started"
    fi

    echo ""
    docker compose ps
}

# Stop services
stop_services() {
    print_header "Stopping Services"

    if [ -n "$1" ]; then
        docker compose stop "$1"
        print_success "$1 service stopped"
    else
        docker compose stop
        print_success "All services stopped"
    fi
}

# Restart services
restart_services() {
    print_header "Restarting Services"

    if [ -n "$1" ]; then
        docker compose restart "$1"
        print_success "$1 service restarted"
    else
        docker compose restart
        print_success "All services restarted"
    fi
}

# View logs
view_logs() {
    print_header "Viewing Logs"

    if [ -n "$1" ]; then
        docker compose logs -f "$1"
    else
        docker compose logs -f
    fi
}

# Build services
build_services() {
    print_header "Building Services"

    local no_cache=""
    if [ "$2" == "--no-cache" ]; then
        no_cache="--no-cache"
        print_warning "Building without cache"
    fi

    if [ -n "$1" ] && [ "$1" != "--no-cache" ]; then
        docker compose build $no_cache "$1"
        print_success "$1 service built"
    else
        docker compose build $no_cache
        print_success "All services built"
    fi
}

# Clean up
cleanup() {
    print_header "Cleaning Up"

    read -p "This will remove all containers, networks, and volumes. Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v --remove-orphans
        print_success "Cleanup complete"
    else
        print_warning "Cleanup cancelled"
    fi
}

# Database backup
backup_database() {
    print_header "Database Backup"

    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker compose exec -T db pg_dump -U sipzy sipzy > "$backup_file"
    print_success "Database backup created: $backup_file"
}

# Database restore
restore_database() {
    print_header "Database Restore"

    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        exit 1
    fi

    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi

    read -p "This will replace current database. Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat "$1" | docker compose exec -T db psql -U sipzy -d sipzy
        print_success "Database restored from: $1"
    else
        print_warning "Restore cancelled"
    fi
}

# Health check
health_check() {
    print_header "Health Check"

    echo -e "${BLUE}Service Status:${NC}"
    docker compose ps

    echo ""
    echo -e "${BLUE}Backend Health:${NC}"
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi

    echo ""
    echo -e "${BLUE}Frontend Health:${NC}"
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi

    echo ""
    echo -e "${BLUE}Database Health:${NC}"
    if docker compose exec -T db pg_isready -U sipzy > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database is not responding"
    fi
}

# Show help
show_help() {
    cat << EOF
${BLUE}Sipzy Docker Helper Script${NC}

Usage: ./docker-helper.sh [command] [options]

${YELLOW}Commands:${NC}
  start [service]       Start services (all, backend, frontend, db, or dev)
  stop [service]        Stop services (all or specific service)
  restart [service]     Restart services (all or specific service)
  logs [service]        View logs (all or specific service)
  build [service]       Build services (add --no-cache to rebuild from scratch)
  clean                 Stop and remove all containers, networks, and volumes
  backup                Backup database to SQL file
  restore <file>        Restore database from SQL file
  health                Check health status of all services
  shell <service>       Open shell in service container
  help                  Show this help message

${YELLOW}Examples:${NC}
  ./docker-helper.sh start              # Start all services
  ./docker-helper.sh start dev          # Start with pgAdmin
  ./docker-helper.sh start backend      # Start only backend (and dependencies)
  ./docker-helper.sh logs backend       # View backend logs
  ./docker-helper.sh build --no-cache   # Rebuild all from scratch
  ./docker-helper.sh backup             # Backup database
  ./docker-helper.sh restore backup.sql # Restore from backup
  ./docker-helper.sh health             # Check all services health
  ./docker-helper.sh shell backend      # Open backend shell

${YELLOW}Services:${NC}
  - db        PostgreSQL database
  - backend   Spring Boot API
  - frontend  Next.js application
  - pgadmin   pgAdmin (dev profile only)

EOF
}

# Main script
main() {
    cd "$SCRIPT_DIR"

    case "$1" in
        start)
            check_prerequisites
            start_services "$2"
            ;;
        stop)
            stop_services "$2"
            ;;
        restart)
            restart_services "$2"
            ;;
        logs)
            view_logs "$2"
            ;;
        build)
            build_services "$2" "$3"
            ;;
        clean)
            cleanup
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database "$2"
            ;;
        health)
            health_check
            ;;
        shell)
            if [ -z "$2" ]; then
                print_error "Please specify a service"
                exit 1
            fi
            docker compose exec "$2" sh
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
