# CI/CD Setup Guide

## Architecture

**Pipeline GitHub Actions** → **Self-hosted Runner (VPS)** → **SonarQube (VPS)** → **Docker Hub**

## 1. Setup SonarQube sur VPS

```bash
# Lancer SonarQube
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
# Aller dans Settings > Actions > Runners > New self-hosted runner
# Suivre les instructions GitHub pour installer le runner

# Lancer le runner
./run.sh

# Ou en service systemd
sudo ./svc.sh install
sudo ./svc.sh start
```

## 3. Configurer GitHub Secrets

Dans `Settings > Secrets and variables > Actions` :

```
SONAR_TOKEN=<token_from_sonarqube>
DOCKER_USERNAME=<docker_hub_username>
DOCKER_PASSWORD=<docker_hub_token>
API_URL=<backend_api_url>
```

## 4. Build des Images de Base (OBLIGATOIRE - une seule fois)

Les Dockerfiles utilisent des images de base personnalisées pour accélérer les builds.
Tu dois les créer une fois :

```bash
# 1. Login Docker Hub
docker login

# 2. Build backend base image (Java 21 + outils)
docker build -t ztoumia/backend:latest \
  -f docker/base/backend.Dockerfile \
  docker/base/
docker push ztoumia/backend:latest

# 3. Build frontend base image (Node 20 + outils)
docker build -t ztoumia/frontend:latest \
  -f docker/base/frontend.Dockerfile \
  docker/base/
docker push ztoumia/frontend:latest
```

**Important** : Ces images de base contiennent tous les outils de build pré-installés.
Les builds GitHub Actions seront 2-3x plus rapides après cette étape.

## 5. Workflow Pipeline

Le pipeline `.github/workflows/deploy.yml` fait automatiquement :

1. ✅ **Détection** des services modifiés
2. ✅ **Tests** unitaires (Gradle, npm test)
3. ✅ **Coverage** (JaCoCo, lcov)
4. ✅ **SonarQube** analysis
5. ✅ **Docker build** multi-platform (amd64, arm64)
6. ✅ **Docker push** vers Docker Hub
7. ✅ **Trivy scan** sécurité
8. ✅ **Summary** complet

## 6. Accès aux Rapports

- **SonarQube**: http://VPS_IP:9001
  - Backend: `/dashboard?id=sipzy-backend`
  - Frontend: `/dashboard?id=sipzy-frontend`
  - Backoffice: `/dashboard?id=sipzy-backoffice`

- **GitHub Actions**: Onglet "Actions" du repo
  - Résumé dans "Summary"
  - Sécurité dans "Security"

## Troubleshooting

**Runner ne voit pas SonarQube** :
- Vérifier que SonarQube tourne : `docker ps`
- Utiliser `http://sonarqube:9001` ou l'IP du VPS

**Tests échouent** :
- Backend : `cd backend && ./gradlew test`
- Frontend : `cd frontend && npm test`

**Docker build fail** :
- Vérifier les logs dans GitHub Actions
- Tester localement : `docker build -t test -f backend/Dockerfile ./backend`
