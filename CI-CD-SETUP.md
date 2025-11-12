# CI/CD Setup Guide - VPS Deployment

## Architecture

**GitHub Actions (self-hosted runner)** → **Build localement** → **Deploy sur VPS**

Pas de Docker Hub, tout est local sur le VPS.

## 1. Setup SonarQube sur VPS

```bash
docker run -d --name sonarqube \
  -p 9001:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_logs:/opt/sonarqube/logs \
  --restart unless-stopped \
  sonarqube:10.8.0-community

# Accès: http://VPS_IP:9001
# Login: admin/admin (changer au premier login)
```

## 2. Setup GitHub Self-Hosted Runner sur VPS

```bash
# Dans Settings > Actions > Runners > New self-hosted runner
# Suivre les instructions GitHub

# Lancer comme service
sudo ./svc.sh install
sudo ./svc.sh start
```

## 3. Configurer GitHub Secrets

Dans `Settings > Secrets and variables > Actions` :

```
# SonarQube
SONAR_TOKEN=<token_from_sonarqube>

# Database
POSTGRES_PASSWORD=<strong_password>
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/sipzy
SPRING_DATASOURCE_USERNAME=sipzy
SPRING_DATASOURCE_PASSWORD=<strong_password>

# Backend
JWT_SECRET=<random_256bit_secret>
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Frontend
API_URL=http://VPS_IP:8080
CORS_ALLOWED_ORIGINS=http://VPS_IP:3000,http://VPS_IP:3001
```

## 4. Build des Images de Base (OBLIGATOIRE - une seule fois)

```bash
docker login

# Backend base
docker build -t ztoumia/backend:latest \
  -f docker/base/backend.Dockerfile \
  docker/base/
docker push ztoumia/backend:latest

# Frontend base
docker build -t ztoumia/frontend:latest \
  -f docker/base/frontend.Dockerfile \
  docker/base/
docker push ztoumia/frontend:latest
```

## 5. Pipeline Automatique

Le workflow fait automatiquement :

1. ✅ **Détection** des services modifiés
2. ✅ **Tests** unitaires (Gradle, npm test)
3. ✅ **Coverage** (JaCoCo, lcov)
4. ✅ **SonarQube** analysis
5. ✅ **Docker build** local (pas de push)
6. ✅ **Trivy scan** sécurité
7. ✅ **Deploy** sur VPS avec docker-compose

**Déploiement** : Uniquement sur push vers `main`

## 6. Vérifier le Déploiement

```bash
# Voir les services qui tournent
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Status
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:3000                   # Frontend
curl http://localhost:3001                   # Backoffice
```

## Services Déployés

| Service | Port | URL |
|---------|------|-----|
| Backend | 8080 | http://VPS_IP:8080 |
| Frontend | 3000 | http://VPS_IP:3000 |
| Backoffice | 3001 | http://VPS_IP:3001 |
| PostgreSQL | 5432 | localhost:5432 |
| SonarQube | 9001 | http://VPS_IP:9001 |

## Accès aux Rapports

- **SonarQube**: http://VPS_IP:9001
  - Backend: `/dashboard?id=sipzy-backend`
  - Frontend: `/dashboard?id=sipzy-frontend`
  - Backoffice: `/dashboard?id=sipzy-backoffice`

- **GitHub Actions**: Onglet "Actions" du repo
  - Summary avec statut de déploiement
  - Security tab pour Trivy scans

## Troubleshooting

**Services ne démarrent pas** :
```bash
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml ps
```

**Rebuild une image** :
```bash
# Backend
docker build -t sipzy-backend:latest -f backend/Dockerfile ./backend

# Frontend
docker build -t sipzy-frontend:latest \
  --build-context shared=./shared \
  --build-arg NEXT_PUBLIC_API_URL=http://VPS_IP:8080 \
  -f frontend/Dockerfile ./frontend

# Redéployer
docker-compose -f docker-compose.prod.yml up -d
```

**Database reset** :
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```
