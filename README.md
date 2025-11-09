# Sipzy.coffee ☕

Community platform for coffee enthusiasts to discover, rate, and share specialty coffee experiences.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone git@github.com:ztoumia/sipzy.git
cd sipzy

# Copy environment file
cp .env.example .env

# Start all services
docker compose up -d

# Or use the helper script
./docker-helper.sh start  # Linux/macOS
.\docker-helper.ps1 start # Windows
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- pgAdmin (dev): http://localhost:5050

### Option 2: Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**Backend:**
```bash
cd backend
./gradlew bootRun
# → http://localhost:8080
# → http://localhost:8080/swagger-ui.html
```

## 📁 Project Structure

```
sipzy/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── backend/                    # Spring Boot API
│   ├── src/
│   ├── Dockerfile             # Backend Docker image
│   ├── docker-compose.yml     # Local database
│   └── docs/                  # Backend documentation
├── frontend/                   # Next.js app
│   ├── app/
│   ├── Dockerfile             # Frontend Docker image
│   └── docs/                  # Frontend documentation
├── docker-compose.yml          # Full stack orchestration
├── docker-helper.sh            # Helper script (Linux/macOS)
├── docker-helper.ps1           # Helper script (Windows)
├── .env.example                # Environment template
└── DOCKER.md                   # Docker documentation
```

## 📚 Documentation

### General
- **[DOCKER.md](DOCKER.md)** - Complete Docker & CI/CD guide
- **[.env.example](.env.example)** - Environment variables reference

### Frontend
- [Frontend README](frontend/docs/README.md) - Setup & quick start
- [Components](frontend/docs/COMPONENTS.md) - Component library
- [Deployment](frontend/docs/DEPLOYMENT.md) - Deployment guide

### Backend
- [Backend README](backend/docs/README.md) - Setup & quick start
- [API Reference](backend/docs/API.md) - API endpoints
- [Database Schema](backend/docs/DATABASE.md) - Database structure

## Status

| Component | Status | Description |
|-----------|--------|-------------|
| Frontend | ✅ **Production Ready** | Next.js 15, React 19, TypeScript |
| Backend | ✅ **Production Ready** | Spring Boot 3.2, PostgreSQL, 12 controllers, 46/46 tests |

## Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18 + TypeScript
- Tailwind CSS 4
- React Hook Form + Zod

**Backend:**
- Spring Boot 3.2
- Java 17
- PostgreSQL 15
- Flyway migrations

## Features

- ✅ User authentication & profiles
- ✅ Coffee catalog with advanced filters
- ✅ Reviews & ratings system
- ✅ Favorites management
- ✅ SEO optimized
- ✅ WCAG 2.1 AA compliant
- ⏳ Admin moderation dashboard
- ⏳ Image uploads (Cloudinary)
- ⏳ Email notifications

## 🛠️ Development

### Prerequisites

**For Docker (Recommended):**
- Docker Engine 24.0+
- Docker Compose 2.20+
- 4GB RAM minimum

**For Local Development:**
- Node.js 20+
- Java 17+
- PostgreSQL 15+
- Gradle 8.5+

### Docker Commands

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up backend -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Rebuild services
docker compose build --no-cache

# Complete guide in DOCKER.md
```

### Helper Scripts

**Linux/macOS:**
```bash
./docker-helper.sh start        # Start all services
./docker-helper.sh logs backend # View backend logs
./docker-helper.sh health       # Check service health
./docker-helper.sh backup       # Backup database
```

**Windows:**
```powershell
.\docker-helper.ps1 start        # Start all services
.\docker-helper.ps1 logs backend # View backend logs
.\docker-helper.ps1 health       # Check service health
.\docker-helper.ps1 backup       # Backup database
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
POSTGRES_USER=sipzy
POSTGRES_PASSWORD=sipzy123

# JWT
JWT_SECRET=your-secret-key-min-256-bits

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
```

## 🚀 CI/CD & Deployment

### GitHub Actions

The project includes automated CI/CD that:
- Detects changed services (backend/frontend)
- Builds Docker images for modified services only
- Pushes to Docker Hub with proper tags
- Runs security scans with Trivy
- Supports manual triggers for specific services

**Required GitHub Secrets:**
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub access token

### Docker Hub Images

Images are automatically published to:
- `ztoumia/sipzy-backend:latest`
- `ztoumia/sipzy-frontend:latest`

### Production Deployment

**Using Docker Compose:**
```bash
# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Start services
docker compose -f docker-compose.prod.yml up -d
```

**Cloud Platforms:**
- **Frontend:** Vercel, Netlify, or Docker
- **Backend:** Render, Railway, or any Docker host
- **Database:** Render PostgreSQL, Supabase, or managed PostgreSQL

See [DOCKER.md](DOCKER.md) for detailed deployment guides.

## License

Proprietary - Sipzy.coffee © 2025
