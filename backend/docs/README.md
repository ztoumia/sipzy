# Backend Documentation

## Quick Start

```bash
# Setup database
createdb sipzy_db

# Run application
./gradlew bootRun

# Access
http://localhost:8080
http://localhost:8080/swagger-ui.html
```

## Structure

```
backend/
├── docs/
│   ├── README.md          # This file
│   ├── API.md             # API endpoints
│   ├── DATABASE.md        # Schema & migrations
│   └── SETUP.md           # Development setup
└── src/main/java/com/sipzy/
    ├── admin/             # Admin management
    ├── auth/              # Authentication
    ├── coffee/            # Coffee catalog
    ├── common/            # Shared utilities
    ├── config/            # Spring configuration
    ├── review/            # Reviews & ratings
    ├── upload/            # File uploads
    └── user/              # User management
```

## Documentation

- **[SETUP.md](SETUP.md)** - Development environment setup
- **[API.md](API.md)** - API endpoints & contracts
- **[DATABASE.md](DATABASE.md)** - Database schema & migrations

## Status

- ✅ Structure (Controllers, Entities, DTOs, Config)
- ⏳ Services (business logic) - TO DO
- ⏳ Repositories (data access) - TO DO
- ⏳ Migrations (database schema) - TO DO
- ⏳ Tests - TO DO
