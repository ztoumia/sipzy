# Sipzy Backend

Backend API pour Sipzy - Plateforme de découverte et review de cafés spécialisés.

## Technologies

- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL 15**
- **Flyway** (migrations)
- **MapStruct** (mappings)
- **JWT** (authentification)
- **Cloudinary** (upload d'images)
- **Bucket4j** (rate limiting)

## Démarrage rapide

### 1. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

Cela démarre PostgreSQL sur le port 5432 avec:
- Database: `sipzy`
- User: `sipzy`
- Password: `sipzy123`

### 2. Configurer les variables d'environnement

Créer `src/main/resources/application-local.properties`:

```properties
# PostgreSQL (déjà configuré avec docker-compose)
spring.datasource.url=jdbc:postgresql://localhost:5432/sipzy
spring.datasource.username=sipzy
spring.datasource.password=sipzy123

# JWT Secret (générer une clé sécurisée en production)
jwt.secret=your-secret-key-minimum-256-bits-for-production

# Cloudinary (obtenir sur cloudinary.com)
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

# SMTP (optionnel - pour les emails)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Lancer l'application

```bash
# Développement
./gradlew bootRun --args='--spring.profiles.active=local'

# Ou avec IntelliJ IDEA / VS Code
# Run configuration avec profil: local
```

### 4. Lancer les tests

```bash
# S'assurer que PostgreSQL est démarré
docker-compose up -d

# Lancer tous les tests
./gradlew test

# Ou build complet avec tests
./gradlew clean build
```

### 5. Build sans tests (plus rapide)

```bash
./gradlew clean build -x test
```

## API Documentation

Une fois l'application démarrée, accéder à:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## Migrations Flyway

Les migrations sont automatiquement exécutées au démarrage:

- `V1__init_schema.sql` - Tables principales
- `V2__add_indexes.sql` - Index de performance
- `V3__add_triggers.sql` - Triggers pour stats
- `V4__seed_notes.sql` - 30 notes de dégustation
- `V5__seed_roasters.sql` - 10 roasters de démo
- `V6__seed_admin.sql` - Utilisateur admin + démo
- `V7__enable_pg_trgm.sql` - Extension full-text search
- `V8__add_user_is_active.sql` - Colonne pour ban/unban

## Utilisateurs de démo

Après les migrations, ces utilisateurs sont disponibles:

- **Admin**: `admin@sipzy.coffee` / `Admin123!`
- **User**: `john@example.com` / `User123!`

## Structure du projet

```
src/main/java/com/sipzy/
├── auth/          # Authentification (JWT)
├── coffee/        # Gestion des cafés (CQRS)
├── review/        # Reviews et votes
├── user/          # Profils utilisateurs
├── admin/         # Administration et modération
├── upload/        # Upload Cloudinary
├── notification/  # Service d'emails
├── config/        # Configuration (Security, Cache, Rate Limit)
└── common/        # DTOs, exceptions, utils partagés
```

## Fonctionnalités

### Core Features ✅
- Authentification JWT avec refresh tokens
- CRUD Cafés avec modération (PENDING → APPROVED/REJECTED)
- Reviews avec système de votes (helpful/not helpful)
- Upload d'images via Cloudinary (signature-based)
- Recherche full-text avec filtres avancés
- Profils utilisateurs avec statistiques

### Advanced Features ✅
- **Rate Limiting**: 20/100/1000 req/min (anonymous/auth/admin)
- **Caching**: Spring Cache avec @Cacheable/@CacheEvict
- **Email Service**: Notifications async avec templates HTML
- **User Management**: Admin ban/unban avec isActive
- **Report Moderation**: Système de signalement
- **Image Cleanup**: Auto-delete des anciennes images

## Rate Limiting

- Anonymous: **20 requêtes/minute** (basé sur IP)
- Authenticated: **100 requêtes/minute** (basé sur user)
- Admin: **1000 requêtes/minute**

Retourne **HTTP 429** quand la limite est atteinte.

## Tests

- **Unit Tests**: Services avec Mockito
- **Integration Tests**: Testcontainers avec PostgreSQL (nécessite Docker)
- **API Tests**: Controllers avec MockMvc

```bash
# Tests unitaires uniquement
./gradlew test --tests "*Test"

# Tests d'intégration (nécessite Docker)
./gradlew test --tests "*IntegrationTest"
```

## Déploiement

### Variables d'environnement requises

```bash
# Database
DATABASE_URL=jdbc:postgresql://host:port/dbname
DATABASE_USERNAME=user
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP (optionnel)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email
SPRING_MAIL_PASSWORD=your-password
```

### Docker Build

```bash
# Build JAR
./gradlew clean bootJar

# Le JAR est dans build/libs/backend-1.0.0.jar
```

## Troubleshooting

### Tests échouent avec "Connection refused"

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Si non démarré
docker-compose up -d

# Attendre que PostgreSQL soit prêt (health check)
docker-compose logs -f postgres
```

### Flyway migration errors

```bash
# Reset database (⚠️ PERTE DE DONNÉES)
docker-compose down -v
docker-compose up -d
```

### Port 5432 already in use

```bash
# Changer le port dans docker-compose.yml
ports:
  - "5433:5432"

# Et dans application.properties
spring.datasource.url=jdbc:postgresql://localhost:5433/sipzy
```

## License

Proprietary - Sipzy.coffee © 2024
