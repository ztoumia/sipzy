# Sipzy.coffee

Community platform for coffee enthusiasts to discover, rate, and share specialty coffee experiences.

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend
```bash
cd backend
./gradlew bootRun
# → http://localhost:8080
# → http://localhost:8080/swagger-ui.html
```

## Project Structure

```
Sipzy/
├── frontend/          # Next.js 15 app
│   └── docs/         # Frontend documentation
├── backend/          # Spring Boot API
│   └── docs/         # Backend documentation
└── README.md         # This file
```

## Documentation

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
| Frontend | ✅ **Production Ready** | Next.js 15, React 18, TypeScript |
| Backend | ⏳ **In Progress (35%)** | Spring Boot 3.2, PostgreSQL |

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

## Development

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 15+

### Environment Setup

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Backend** (`application-dev.yml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sipzy_db
```

## Deployment

- **Frontend:** Vercel (recommended) or Netlify
- **Backend:** Render or Docker
- **Database:** Render PostgreSQL

See deployment docs in respective `/docs` folders.

## License

Proprietary - Sipzy.coffee © 2025
