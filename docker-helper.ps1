# ========================================
# Sipzy Docker Helper Script (PowerShell)
# ========================================

param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1)]
    [string]$Service,

    [Parameter(Position=2)]
    [string]$Option
)

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $args -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

# Check prerequisites
function Test-Prerequisites {
    Write-Header "Checking Prerequisites"

    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    Write-Success "Docker installed"

    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    Write-Success "Docker Compose installed"

    if (!(Test-Path ".env")) {
        Write-Warning ".env file not found, copying from .env.example"
        Copy-Item ".env.example" ".env"
        Write-Success ".env file created"
    }
}

# Start services
function Start-Services {
    param([string]$ServiceName)

    Write-Header "Starting Services"

    if ($ServiceName -eq "dev") {
        docker compose --profile dev up -d
        Write-Success "All services started (including pgAdmin)"
    }
    elseif ($ServiceName) {
        docker compose up $ServiceName -d
        Write-Success "$ServiceName service started"
    }
    else {
        docker compose up -d
        Write-Success "All services started"
    }

    Write-Host ""
    docker compose ps
}

# Stop services
function Stop-Services {
    param([string]$ServiceName)

    Write-Header "Stopping Services"

    if ($ServiceName) {
        docker compose stop $ServiceName
        Write-Success "$ServiceName service stopped"
    }
    else {
        docker compose stop
        Write-Success "All services stopped"
    }
}

# Restart services
function Restart-Services {
    param([string]$ServiceName)

    Write-Header "Restarting Services"

    if ($ServiceName) {
        docker compose restart $ServiceName
        Write-Success "$ServiceName service restarted"
    }
    else {
        docker compose restart
        Write-Success "All services restarted"
    }
}

# View logs
function Show-Logs {
    param([string]$ServiceName)

    Write-Header "Viewing Logs"

    if ($ServiceName) {
        docker compose logs -f $ServiceName
    }
    else {
        docker compose logs -f
    }
}

# Build services
function Build-Services {
    param([string]$ServiceName, [string]$Option)

    Write-Header "Building Services"

    $noCache = ""
    if ($Option -eq "--no-cache") {
        $noCache = "--no-cache"
        Write-Warning "Building without cache"
    }

    if ($ServiceName -and $ServiceName -ne "--no-cache") {
        docker compose build $noCache $ServiceName
        Write-Success "$ServiceName service built"
    }
    else {
        docker compose build $noCache
        Write-Success "All services built"
    }
}

# Clean up
function Remove-All {
    Write-Header "Cleaning Up"

    $confirmation = Read-Host "This will remove all containers, networks, and volumes. Continue? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker compose down -v --remove-orphans
        Write-Success "Cleanup complete"
    }
    else {
        Write-Warning "Cleanup cancelled"
    }
}

# Database backup
function Backup-Database {
    Write-Header "Database Backup"

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"

    docker compose exec -T db pg_dump -U sipzy sipzy | Out-File -FilePath $backupFile -Encoding UTF8
    Write-Success "Database backup created: $backupFile"
}

# Database restore
function Restore-Database {
    param([string]$BackupFile)

    Write-Header "Database Restore"

    if (!$BackupFile) {
        Write-Error "Please provide backup file path"
        exit 1
    }

    if (!(Test-Path $BackupFile)) {
        Write-Error "Backup file not found: $BackupFile"
        exit 1
    }

    $confirmation = Read-Host "This will replace current database. Continue? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Get-Content $BackupFile | docker compose exec -T db psql -U sipzy -d sipzy
        Write-Success "Database restored from: $BackupFile"
    }
    else {
        Write-Warning "Restore cancelled"
    }
}

# Health check
function Test-Health {
    Write-Header "Health Check"

    Write-Host "Service Status:" -ForegroundColor Blue
    docker compose ps

    Write-Host "`nBackend Health:" -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
    }
    catch {
        Write-Error "Backend is not responding"
    }

    Write-Host "`nFrontend Health:" -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is healthy"
        }
    }
    catch {
        Write-Error "Frontend is not responding"
    }

    Write-Host "`nDatabase Health:" -ForegroundColor Blue
    $dbHealth = docker compose exec -T db pg_isready -U sipzy 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database is healthy"
    }
    else {
        Write-Error "Database is not responding"
    }
}

# Show help
function Show-Help {
    Write-Host @"

Sipzy Docker Helper Script (PowerShell)

Usage: .\docker-helper.ps1 [command] [options]

Commands:
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

Examples:
  .\docker-helper.ps1 start              # Start all services
  .\docker-helper.ps1 start dev          # Start with pgAdmin
  .\docker-helper.ps1 start backend      # Start only backend (and dependencies)
  .\docker-helper.ps1 logs backend       # View backend logs
  .\docker-helper.ps1 build --no-cache   # Rebuild all from scratch
  .\docker-helper.ps1 backup             # Backup database
  .\docker-helper.ps1 restore backup.sql # Restore from backup
  .\docker-helper.ps1 health             # Check all services health
  .\docker-helper.ps1 shell backend      # Open backend shell

Services:
  - db        PostgreSQL database
  - backend   Spring Boot API
  - frontend  Next.js application
  - pgadmin   pgAdmin (dev profile only)

"@ -ForegroundColor Cyan
}

# Main execution
Push-Location $PSScriptRoot

switch ($Command) {
    "start" {
        Test-Prerequisites
        Start-Services -ServiceName $Service
    }
    "stop" {
        Stop-Services -ServiceName $Service
    }
    "restart" {
        Restart-Services -ServiceName $Service
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    "build" {
        Build-Services -ServiceName $Service -Option $Option
    }
    "clean" {
        Remove-All
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database -BackupFile $Service
    }
    "health" {
        Test-Health
    }
    "shell" {
        if (!$Service) {
            Write-Error "Please specify a service"
            exit 1
        }
        docker compose exec $Service sh
    }
    default {
        if ($Command) {
            Write-Error "Unknown command: $Command`n"
        }
        Show-Help
    }
}

Pop-Location
