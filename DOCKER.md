# 🐳 Sipzy - Docker & CI/CD Documentation

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Service Management](#service-management)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker Engine 24.0+ & Docker Compose 2.20+
- Docker Hub account (for CI/CD)
- Git
- 4GB RAM minimum, 8GB recommended

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone git@github.com:ztoumia/sipzy.git
cd sipzy

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Start All Services

```bash
# Build and start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **pgAdmin** (dev only): http://localhost:5050

---

## Service Management

### Start Individual Services

```bash
# Start only database
docker compose up db -d

# Start backend (will auto-start db)
docker compose up backend -d

# Start frontend (will auto-start backend and db)
docker compose up frontend -d

# Start with pgAdmin (development)
docker compose --profile dev up -d
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop specific service
docker compose stop backend

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v
```

### Rebuild Services

```bash
# Rebuild all services
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild with no cache
docker compose build --no-cache backend

# Rebuild and restart
docker compose up -d --build backend
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Since timestamp
docker compose logs --since 2024-01-01T10:00:00 frontend
```

### Execute Commands in Containers

```bash
# Backend shell
docker compose exec backend sh

# Run Gradle command
docker compose exec backend gradle clean build

# Database psql
docker compose exec db psql -U sipzy -d sipzy

# Frontend shell
docker compose exec frontend sh
```

---

## Environment Configuration

### Core Variables

```env
# Docker Registry
DOCKER_REGISTRY=ztoumia
BACKEND_VERSION=latest
FRONTEND_VERSION=latest

# Database
POSTGRES_DB=sipzy
POSTGRES_USER=sipzy
POSTGRES_PASSWORD=sipzy123
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=8080
SPRING_PROFILE=dev
JWT_SECRET=your-secret-key-min-256-bits
JAVA_OPTS=-Xms256m -Xmx512m

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional)
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Environment-Specific Configs

**Development:**
```bash
SPRING_PROFILE=dev
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Production:**
```bash
SPRING_PROFILE=prod
CORS_ALLOWED_ORIGINS=https://yourdomain.com
JWT_SECRET=generate-strong-secret
JAVA_OPTS=-Xms512m -Xmx1024m
```

---

## CI/CD Pipeline

### GitHub Secrets Configuration

Go to your repository: **Settings → Secrets and variables → Actions**

Add these secrets:

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-token
API_URL=https://api.yourdomain.com  # Optional
```

### Automated Builds

The pipeline automatically detects changes and builds only modified services:

```yaml
# Push to main/master → Build changed services
git push origin main

# Only backend changed → Builds backend only
# Only frontend changed → Builds frontend only
# Both changed → Builds both
```

### Manual Trigger

Trigger builds manually from GitHub Actions:

1. Go to **Actions** tab
2. Select **Build and Deploy to Docker Hub**
3. Click **Run workflow**
4. Choose service: `all`, `backend`, or `frontend`

### Pipeline Stages

1. **Detect Changes** - Identifies modified services
2. **Build & Push** - Builds Docker images and pushes to Docker Hub
3. **Security Scan** - Scans images with Trivy
4. **Deployment Summary** - Creates deployment report

### Image Tagging Strategy

```
# Branch-based
ztoumia/sipzy-backend:main
ztoumia/sipzy-backend:develop

# Latest (on main/master)
ztoumia/sipzy-backend:latest

# Commit SHA
ztoumia/sipzy-backend:main-a1b2c3d

# Semantic versioning (if tagged)
ztoumia/sipzy-backend:1.0.0
ztoumia/sipzy-backend:1.0
```

---

## Production Deployment

### Using Pre-built Images

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    # ... same as docker-compose.yml

  backend:
    image: ztoumia/sipzy-backend:latest
    # No build section, uses pre-built image
    environment:
      SPRING_PROFILES_ACTIVE: prod
      # ... production env vars

  frontend:
    image: ztoumia/sipzy-frontend:latest
    # No build section, uses pre-built image
    environment:
      NODE_ENV: production
      # ... production env vars
```

Deploy:

```bash
# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Health Checks

All services have built-in health checks:

```bash
# Check health status
docker compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' sipzy-backend | jq
```

### Scaling Services

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# With load balancer (requires nginx)
# See docker-compose.prod.yml for full setup
```

### Backup & Restore

**Backup Database:**
```bash
# Create backup
docker compose exec db pg_dump -U sipzy sipzy > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use volume backup
docker run --rm -v sipzy-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

**Restore Database:**
```bash
# From SQL dump
cat backup.sql | docker compose exec -T db psql -U sipzy -d sipzy

# From volume backup
docker run --rm -v sipzy-postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Change port in .env
BACKEND_PORT=8081
```

**2. Database Connection Failed**
```bash
# Check database is healthy
docker compose ps db

# View database logs
docker compose logs db

# Restart database
docker compose restart db

# Wait for healthy state
docker compose up db --wait
```

**3. Backend Build Fails**
```bash
# Clean and rebuild
docker compose build --no-cache backend

# Check Gradle wrapper permissions
chmod +x backend/gradlew

# View detailed build logs
docker compose build backend --progress=plain
```

**4. Frontend Build Fails**
```bash
# Clear Next.js cache
rm -rf frontend/.next

# Rebuild with no cache
docker compose build --no-cache frontend

# Check Node version
docker compose run frontend node --version
```

**5. Out of Memory**
```bash
# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → 8GB

# Or adjust JVM memory
JAVA_OPTS=-Xms256m -Xmx512m
```

### Debug Mode

**Backend:**
```bash
# Enable debug logging
docker compose exec backend sh -c 'export LOGGING_LEVEL_ROOT=DEBUG && java -jar app.jar'
```

**Frontend:**
```bash
# View Next.js debug info
docker compose exec frontend sh -c 'DEBUG=* npm start'
```

### Clean Reset

```bash
# Stop all services
docker compose down

# Remove all containers, networks, volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Prune Docker system
docker system prune -a --volumes

# Fresh start
docker compose up -d --build
```

---

## Performance Optimization

### Build Cache

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build

# Save build cache
docker compose build --cache-to=type=local,dest=/tmp/cache

# Load build cache
docker compose build --cache-from=type=local,src=/tmp/cache
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Monitoring

```bash
# Resource usage
docker stats

# Specific service
docker stats sipzy-backend

# Export metrics
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)

---

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues and discussions
- Review logs: `docker compose logs -f`

---

**Last Updated:** 2025-01-27
**Version:** 1.0.0
