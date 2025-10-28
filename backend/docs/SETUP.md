# Backend Setup

## Prerequisites

- Java 17+
- PostgreSQL 15+
- Gradle 8.5 (included via wrapper)

## Installation

### 1. Database Setup

```bash
# Create database
createdb sipzy_db

# Or with psql
psql -U postgres
CREATE DATABASE sipzy_db;
CREATE USER sipzy_user WITH PASSWORD 'sipzy_dev';
GRANT ALL PRIVILEGES ON DATABASE sipzy_db TO sipzy_user;
```

### 2. Configuration

File: `src/main/resources/application-dev.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sipzy_db
    username: sipzy_user
    password: sipzy_dev
```

### 3. Run Application

```bash
# Development mode (auto-reload)
./gradlew bootRun

# Build JAR
./gradlew build

# Run tests
./gradlew test
```

## Environment Variables (Production)

```bash
DATABASE_URL=jdbc:postgresql://host:5432/sipzy_db
DB_USERNAME=sipzy_user
DB_PASSWORD=***
JWT_SECRET=*** (256 bits minimum)
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
```

## Troubleshooting

### Port 8080 in use

```yaml
# application.yml
server:
  port: 8081
```

### Database connection failed

```bash
# Check PostgreSQL is running
# Windows: services.msc
# Linux: sudo systemctl status postgresql
# Mac: brew services list
```

### Flyway migration error

```sql
-- Reset database
DROP DATABASE sipzy_db;
CREATE DATABASE sipzy_db;
```
