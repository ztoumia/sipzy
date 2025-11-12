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

## 4. Build des Images de Base (Optionnel - pour accélérer)

```bash
# Backend base image
docker build -t YOUR_USERNAME/sipzy-backend-base:latest \
  -f docker/base/backend.Dockerfile .
docker push YOUR_USERNAME/sipzy-backend-base:latest

# Frontend base image
docker build -t YOUR_USERNAME/sipzy-frontend-base:latest \
  -f docker/base/frontend.Dockerfile .
docker push YOUR_USERNAME/sipzy-frontend-base:latest
```

Puis modifier les Dockerfiles pour utiliser ces images de base au lieu de `eclipse-temurin` et `node`.

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
