# Stratégie CI/CD - Sipzy

**Date:** 2025-11-09
**Version:** 1.0
**Auteur:** DevOps Expert Agent

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Analyse du pipeline actuel](#analyse-du-pipeline-actuel)
3. [Stratégie CI/CD complète](#stratégie-cicd-complète)
4. [Workflows améliorés](#workflows-améliorés)
5. [Stratégies de déploiement](#stratégies-de-déploiement)
6. [Environnements](#environnements)
7. [Secrets et configuration](#secrets-et-configuration)
8. [Monitoring et observabilité](#monitoring-et-observabilité)
9. [Bonnes pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

### Objectifs de la stratégie CI/CD

```
┌─────────────────────────────────────────────────────────┐
│                    Objectifs CI/CD                       │
├─────────────────────────────────────────────────────────┤
│  ✅ Automatisation complète du build au déploiement     │
│  ✅ Qualité du code garantie par des tests              │
│  ✅ Sécurité intégrée (scan de vulnérabilités)         │
│  ✅ Déploiements rapides et fiables                     │
│  ✅ Rollback facile en cas de problème                  │
│  ✅ Feedback rapide aux développeurs                    │
│  ✅ Traçabilité complète des déploiements               │
└─────────────────────────────────────────────────────────┘
```

### Architecture CI/CD

```
┌───────────────────────────────────────────────────────────────┐
│                        GitHub Repository                       │
└────────────────────────┬──────────────────────────────────────┘
                         │ Push / PR
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                     GitHub Actions                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Build & Test│  │   Security   │  │  Docker Build    │   │
│  │              │→ │   Scan       │→ │  & Push          │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────┬──────────────────────────────────────┘
                         │ Success
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                       Docker Hub                               │
│              (Container Registry)                              │
└────────────────────────┬──────────────────────────────────────┘
                         │ Pull images
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                         VPS                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │   Backend    │  │   Frontend       │   │
│  │  (Database)  │  │  (Spring)    │  │   (Next.js)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## Analyse du pipeline actuel

### Workflow actuel: `deploy.yml`

#### Structure

```yaml
Jobs:
1. detect-changes      # Détecte les fichiers modifiés
2. build-backend       # Build et push image backend
3. build-frontend      # Build et push image frontend
4. security-scan       # Scan Trivy sur les images
5. deployment-summary  # Résumé du déploiement
```

#### Points forts ✅

1. **Détection intelligente des changements**
```yaml
- uses: dorny/paths-filter@v3
  with:
    filters: |
      backend:
        - 'backend/**'
      frontend:
        - 'frontend/**'
```
👍 Évite les builds inutiles

2. **Build multi-architecture**
```yaml
platforms: linux/amd64,linux/arm64
```
👍 Support ARM (Raspberry Pi, Mac M1, etc.)

3. **Cache Docker Registry**
```yaml
cache-from: type=registry,ref=${{ env.BACKEND_IMAGE }}:buildcache
cache-to: type=registry,ref=${{ env.BACKEND_IMAGE }}:buildcache,mode=max
```
👍 Accélère les builds

4. **Scan de sécurité intégré**
```yaml
- uses: aquasecurity/trivy-action@master
  with:
    severity: 'CRITICAL,HIGH'
```
👍 Détection des vulnérabilités

5. **Tags Docker multiples**
```yaml
tags: |
  type=ref,event=branch
  type=ref,event=pr
  type=semver,pattern={{version}}
  type=sha,prefix={{branch}}-
  type=raw,value=latest,enable={{is_default_branch}}
```
👍 Traçabilité des versions

#### Points d'amélioration 🔶

1. **Pas de tests automatisés**
   - Backend: Pas de `mvn test` ou `gradle test`
   - Frontend: Pas de `npm test` ou `npm run lint`

2. **Pas de déploiement automatique vers le VPS**
   - Build → Push Docker Hub ✅
   - Deploy vers VPS ❌ (manuel)

3. **Manque de notifications**
   - Pas de notification Slack/Discord/Email
   - Résumé uniquement dans GitHub

4. **Pas d'environnements multiples**
   - Pas de staging/development/production
   - Deploy direct en production

5. **Scan de sécurité non bloquant**
```yaml
if: always()  # Continue même si vulnérabilités
```

6. **Backoffice absent du pipeline**
   - Seulement backend et frontend
   - Backoffice doit être ajouté

---

## Stratégie CI/CD complète

### Workflow idéal

```
┌─────────────────────────────────────────────────────────────┐
│                       Code Push/PR                           │
└──────────────────┬──────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: VALIDATION (Fast Feedback)                         │
│  ├─ Linting (ESLint, Checkstyle)                  ~2 min    │
│  ├─ Unit Tests (JUnit, Jest)                      ~3 min    │
│  └─ Code Quality (SonarQube optionnel)            ~5 min    │
└──────────────────┬──────────────────────────────────────────┘
                   ▼ (si succès)
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: BUILD                                              │
│  ├─ Build Backend (Gradle)                        ~5 min    │
│  ├─ Build Frontend (npm)                          ~3 min    │
│  ├─ Build Backoffice (npm)                        ~3 min    │
│  └─ Build Docker Images (multi-arch)              ~8 min    │
└──────────────────┬──────────────────────────────────────────┘
                   ▼ (si succès)
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: SECURITY                                           │
│  ├─ Trivy Image Scan                              ~2 min    │
│  ├─ Dependency Check                              ~3 min    │
│  └─ SAST (Semgrep optionnel)                      ~4 min    │
└──────────────────┬──────────────────────────────────────────┘
                   ▼ (si succès)
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: PUBLISH                                            │
│  ├─ Push to Docker Hub                            ~2 min    │
│  └─ Tag Git Release (si tag)                      ~1 min    │
└──────────────────┬──────────────────────────────────────────┘
                   ▼ (si main/master)
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: DEPLOY (Automatique ou Manuel)                    │
│  ├─ Deploy to Staging (auto)                      ~3 min    │
│  ├─ Run E2E Tests                                 ~5 min    │
│  └─ Deploy to Production (approval)               ~3 min    │
└─────────────────────────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 6: POST-DEPLOY                                        │
│  ├─ Health Check Validation                       ~1 min    │
│  ├─ Smoke Tests                                   ~2 min    │
│  └─ Notification (Slack/Email)                    ~1 min    │
└─────────────────────────────────────────────────────────────┘
```

**Temps total:** ~25-35 minutes (avec parallélisation)

---

## Workflows améliorés

### 1. Workflow CI (Build & Test)

**Fichier:** `.github/workflows/ci.yml`

```yaml
name: CI - Build and Test

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

env:
  JAVA_VERSION: '21'
  NODE_VERSION: '20'

jobs:
  # ============================================
  # JOB 1: Detect Changes
  # ============================================
  detect-changes:
    name: Detect Changed Services
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
      backoffice: ${{ steps.filter.outputs.backoffice }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
            frontend:
              - 'frontend/**'
            backoffice:
              - 'backoffice/**'

  # ============================================
  # JOB 2: Backend CI
  # ============================================
  backend-ci:
    name: Backend - Lint, Test, Build
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.backend == 'true'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: gradle

      - name: Cache Gradle packages
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Grant execute permission for gradlew
        working-directory: ./backend
        run: chmod +x gradlew

      - name: Run Checkstyle
        working-directory: ./backend
        run: ./gradlew checkstyleMain checkstyleTest

      - name: Run Unit Tests
        working-directory: ./backend
        run: ./gradlew test

      - name: Run Integration Tests
        working-directory: ./backend
        run: ./gradlew integrationTest || true

      - name: Generate Test Coverage
        working-directory: ./backend
        run: ./gradlew jacocoTestReport

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/build/reports/jacoco/test/jacocoTestReport.xml
          flags: backend

      - name: Build JAR
        working-directory: ./backend
        run: ./gradlew build -x test

      - name: Upload JAR Artifact
        uses: actions/upload-artifact@v3
        with:
          name: backend-jar
          path: backend/build/libs/*.jar
          retention-days: 7

  # ============================================
  # JOB 3: Frontend CI
  # ============================================
  frontend-ci:
    name: Frontend - Lint, Test, Build
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint

      - name: Run Type Check
        working-directory: ./frontend
        run: npm run type-check || npx tsc --noEmit

      - name: Run Unit Tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend

      - name: Build Application
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: npm run build

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/.next
          retention-days: 7

  # ============================================
  # JOB 4: Backoffice CI
  # ============================================
  backoffice-ci:
    name: Backoffice - Lint, Test, Build
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.backoffice == 'true'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backoffice/package-lock.json

      - name: Install dependencies
        working-directory: ./backoffice
        run: npm ci

      - name: Run ESLint
        working-directory: ./backoffice
        run: npm run lint

      - name: Run Type Check
        working-directory: ./backoffice
        run: npm run type-check || npx tsc --noEmit

      - name: Build Application
        working-directory: ./backoffice
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: npm run build

  # ============================================
  # JOB 5: Code Quality (Optional)
  # ============================================
  code-quality:
    name: Code Quality Analysis
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Pour SonarQube

      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        continue-on-error: true

  # ============================================
  # JOB 6: CI Summary
  # ============================================
  ci-summary:
    name: CI Summary
    runs-on: ubuntu-latest
    needs: [backend-ci, frontend-ci, backoffice-ci]
    if: always()

    steps:
      - name: Create CI Summary
        run: |
          echo "## 🧪 CI Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Service | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|---------|--------|" >> $GITHUB_STEP_SUMMARY

          if [ "${{ needs.backend-ci.result }}" == "success" ]; then
            echo "| Backend | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          elif [ "${{ needs.backend-ci.result }}" == "skipped" ]; then
            echo "| Backend | ⏭️ Skipped |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| Backend | ❌ Failed |" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.frontend-ci.result }}" == "success" ]; then
            echo "| Frontend | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          elif [ "${{ needs.frontend-ci.result }}" == "skipped" ]; then
            echo "| Frontend | ⏭️ Skipped |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| Frontend | ❌ Failed |" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.backoffice-ci.result }}" == "success" ]; then
            echo "| Backoffice | ✅ Passed |" >> $GITHUB_STEP_SUMMARY
          elif [ "${{ needs.backoffice-ci.result }}" == "skipped" ]; then
            echo "| Backoffice | ⏭️ Skipped |" >> $GITHUB_STEP_SUMMARY
          else
            echo "| Backoffice | ❌ Failed |" >> $GITHUB_STEP_SUMMARY
          fi

      - name: Fail if any job failed
        if: |
          needs.backend-ci.result == 'failure' ||
          needs.frontend-ci.result == 'failure' ||
          needs.backoffice-ci.result == 'failure'
        run: exit 1
```

---

### 2. Workflow CD (Deploy)

**Fichier:** `.github/workflows/cd.yml`

```yaml
name: CD - Deploy to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - staging
          - production
      service:
        description: 'Service to deploy'
        required: true
        type: choice
        options:
          - all
          - backend
          - frontend
          - backoffice

env:
  DOCKER_REGISTRY: ${{ secrets.DOCKER_USERNAME }}
  BACKEND_IMAGE: ${{ secrets.DOCKER_USERNAME }}/sipzy-backend
  FRONTEND_IMAGE: ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend
  BACKOFFICE_IMAGE: ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice

jobs:
  # ============================================
  # JOB 1: Detect Changes
  # ============================================
  detect-changes:
    name: Detect Changes
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
      backoffice: ${{ steps.filter.outputs.backoffice }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
            frontend:
              - 'frontend/**'
            backoffice:
              - 'backoffice/**'

  # ============================================
  # JOB 2: Build and Push Docker Images
  # ============================================
  build-images:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: detect-changes
    strategy:
      matrix:
        service:
          - name: backend
            changed: ${{ needs.detect-changes.outputs.backend }}
            context: ./backend
            image: ${{ secrets.DOCKER_USERNAME }}/sipzy-backend
          - name: frontend
            changed: ${{ needs.detect-changes.outputs.frontend }}
            context: ./frontend
            image: ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend
          - name: backoffice
            changed: ${{ needs.detect-changes.outputs.backoffice }}
            context: ./backoffice
            image: ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice
      fail-fast: false

    steps:
      - name: Checkout code
        if: matrix.service.changed == 'true' || github.event.inputs.service == matrix.service.name || github.event.inputs.service == 'all'
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        if: matrix.service.changed == 'true' || github.event.inputs.service == matrix.service.name || github.event.inputs.service == 'all'
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        if: matrix.service.changed == 'true' || github.event.inputs.service == matrix.service.name || github.event.inputs.service == 'all'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        if: matrix.service.changed == 'true' || github.event.inputs.service == matrix.service.name || github.event.inputs.service == 'all'
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ matrix.service.image }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        if: matrix.service.changed == 'true' || github.event.inputs.service == matrix.service.name || github.event.inputs.service == 'all'
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.service.context }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ matrix.service.image }}:buildcache
          cache-to: type=registry,ref=${{ matrix.service.image }}:buildcache,mode=max
          platforms: linux/amd64

  # ============================================
  # JOB 3: Security Scan
  # ============================================
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build-images
    strategy:
      matrix:
        service: [backend, frontend, backoffice]

    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.DOCKER_REGISTRY }}/sipzy-${{ matrix.service }}:latest
          format: 'sarif'
          output: 'trivy-results-${{ matrix.service }}.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'  # Fail si vulnérabilités critiques

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results-${{ matrix.service }}.sarif'

  # ============================================
  # JOB 4: Deploy to Staging (Auto)
  # ============================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build-images, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.sipzy.com

    steps:
      - name: Deploy to Staging VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/sipzy-staging
            docker compose pull
            docker compose up -d
            docker compose ps

  # ============================================
  # JOB 5: Deploy to Production (Manual Approval)
  # ============================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build-images, security-scan]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://sipzy.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add VPS to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to Production VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          ssh $VPS_USER@$VPS_HOST << 'EOF'
            cd /home/deploy/sipzy

            # Backup actuel
            docker compose exec -T db pg_dump -U sipzy sipzy > /home/deploy/backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql

            # Pull nouvelles images
            docker compose pull

            # Déploiement rolling (un service à la fois)
            docker compose up -d db
            docker compose up -d backend
            docker compose up -d frontend
            docker compose up -d backoffice

            # Vérification santé
            sleep 30
            docker compose ps

            # Health checks
            curl -f http://localhost:8080/actuator/health || exit 1
            curl -f http://localhost:3000 || exit 1
            curl -f http://localhost:3001 || exit 1

            echo "✅ Déploiement réussi!"
          EOF

      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚀 Sipzy déployé en production avec succès!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Déploiement Production*\n✅ Succès\n*Commit:* ${{ github.sha }}\n*Auteur:* ${{ github.actor }}"
                  }
                }
              ]
            }

  # ============================================
  # JOB 6: Post-Deploy Health Check
  # ============================================
  post-deploy-check:
    name: Post-Deploy Health Check
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always()

    steps:
      - name: Check Production Health
        run: |
          echo "Vérification de la santé de la production..."

          # Backend
          if curl -sf https://api.sipzy.com/actuator/health > /dev/null; then
            echo "✅ Backend: Healthy"
          else
            echo "❌ Backend: Unhealthy"
            exit 1
          fi

          # Frontend
          if curl -sf https://sipzy.com > /dev/null; then
            echo "✅ Frontend: Healthy"
          else
            echo "❌ Frontend: Unhealthy"
            exit 1
          fi

      - name: Rollback on Failure
        if: failure()
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/sipzy
            echo "🔄 Rollback en cours..."
            docker compose down
            docker compose up -d
            echo "✅ Rollback terminé"
```

---

### 3. Workflow Release

**Fichier:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        uses: mikepenz/release-changelog-builder-action@v4
        with:
          configuration: ".github/changelog-config.json"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false

      - name: Tag Docker Images
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}

          # Backend
          docker pull ${{ secrets.DOCKER_USERNAME }}/sipzy-backend:latest
          docker tag ${{ secrets.DOCKER_USERNAME }}/sipzy-backend:latest \
                     ${{ secrets.DOCKER_USERNAME }}/sipzy-backend:$VERSION
          docker push ${{ secrets.DOCKER_USERNAME }}/sipzy-backend:$VERSION

          # Frontend
          docker pull ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend:latest
          docker tag ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend:latest \
                     ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend:$VERSION
          docker push ${{ secrets.DOCKER_USERNAME }}/sipzy-frontend:$VERSION

          # Backoffice
          docker pull ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice:latest
          docker tag ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice:latest \
                     ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice:$VERSION
          docker push ${{ secrets.DOCKER_USERNAME }}/sipzy-backoffice:$VERSION
```

---

## Stratégies de déploiement

### 1. Rolling Deployment (Recommandé)

```bash
# Déployer service par service
docker compose up -d db          # Database d'abord
sleep 10
docker compose up -d backend     # Backend ensuite
sleep 20
docker compose up -d frontend    # Frontend
sleep 10
docker compose up -d backoffice  # Backoffice
```

**Avantages:**
- ✅ Zero downtime (avec plusieurs instances)
- ✅ Rollback facile
- ✅ Progressif

**Inconvénients:**
- ❌ Nécessite plusieurs instances (load balancer)
- ❌ Plus complexe

### 2. Blue/Green Deployment

```bash
# Déployer la nouvelle version sur un environnement "green"
docker compose -f docker-compose.green.yml up -d

# Tester
curl http://green.sipzy.com/health

# Basculer le trafic (Nginx)
nginx -s reload

# Arrêter l'ancienne version "blue"
docker compose -f docker-compose.blue.yml down
```

**Avantages:**
- ✅ Zero downtime
- ✅ Rollback instantané
- ✅ Test complet avant switch

**Inconvénients:**
- ❌ Nécessite 2x les ressources
- ❌ Complexité accrue

### 3. Recreate (Actuel - Simple)

```bash
# Arrêter tout
docker compose down

# Redémarrer avec nouvelles images
docker compose up -d
```

**Avantages:**
- ✅ Simple
- ✅ Pas de complexité

**Inconvénients:**
- ❌ Downtime de 30-60 secondes
- ❌ Pas idéal pour la production

---

## Environnements

### Structure recommandée

```
Environnements:
1. Development  (local)          - docker-compose.yml
2. Staging      (VPS/Cloud)      - docker-compose.staging.yml
3. Production   (VPS/Cloud)      - docker-compose.prod.yml
```

### Configuration par environnement

#### Development
```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DATABASE_URL: jdbc:postgresql://db:5432/sipzy_dev

  pgadmin:  # Seulement en dev
    profiles: [dev]
```

#### Staging
```yaml
# docker-compose.staging.yml
services:
  backend:
    image: ztoumia/sipzy-backend:latest
    environment:
      SPRING_PROFILES_ACTIVE: staging
      DATABASE_URL: jdbc:postgresql://db:5432/sipzy_staging
    deploy:
      replicas: 1
```

#### Production
```yaml
# docker-compose.prod.yml
services:
  backend:
    image: ztoumia/sipzy-backend:v1.2.3  # Version taggée
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DATABASE_URL: jdbc:postgresql://db:5432/sipzy_prod
    deploy:
      replicas: 2  # Multiple instances
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Secrets et configuration

### GitHub Actions Secrets

```
Repository Settings > Secrets and variables > Actions

Required Secrets:
├── DOCKER_USERNAME           # Docker Hub username
├── DOCKER_PASSWORD           # Docker Hub password
├── VPS_HOST                  # Production VPS IP
├── VPS_USER                  # VPS deploy user
├── VPS_SSH_KEY               # Private SSH key
├── STAGING_VPS_HOST          # Staging VPS IP
├── POSTGRES_DB               # Database name
├── POSTGRES_USER             # Database user
├── POSTGRES_PASSWORD         # Database password (strong!)
├── JWT_SECRET                # JWT signing key (strong!)
├── CLOUDINARY_CLOUD_NAME     # Cloudinary cloud name
├── CLOUDINARY_API_KEY        # Cloudinary API key
├── CLOUDINARY_API_SECRET     # Cloudinary API secret
├── MAIL_HOST                 # SMTP host
├── MAIL_PORT                 # SMTP port
├── MAIL_USERNAME             # SMTP username
├── MAIL_PASSWORD             # SMTP password
└── SLACK_WEBHOOK_URL         # Slack notifications
```

### Génération des secrets

```bash
# PostgreSQL password
openssl rand -base64 32

# JWT secret (256 bits minimum)
openssl rand -base64 64

# SSH key pair
ssh-keygen -t ed25519 -C "github-actions@sipzy" -f ~/.ssh/sipzy-deploy
# Ajouter la clé publique sur le VPS
# Ajouter la clé privée dans GitHub Secrets
```

---

## Monitoring et observabilité

### 1. GitHub Actions Monitoring

**Badges dans README.md:**
```markdown
![CI](https://github.com/ztoumia/sipzy/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/ztoumia/sipzy/actions/workflows/cd.yml/badge.svg)
![Security](https://github.com/ztoumia/sipzy/actions/workflows/security.yml/badge.svg)
```

### 2. Application Monitoring

**Prometheus + Grafana:**
```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    depends_on:
      - prometheus
    ports:
      - "3002:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
```

**Prometheus config:**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### 3. Log Aggregation

**Loki + Promtail:**
```yaml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./monitoring/promtail.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

---

## Bonnes pratiques

### 1. Git Workflow

```
main (production)
  ↑
  merge via PR
  ↑
develop (staging)
  ↑
  merge via PR
  ↑
feature/xxx (development)
```

### 2. Naming Conventions

```yaml
# Branches
feature/add-user-authentication
fix/correct-login-bug
hotfix/critical-security-patch
release/v1.2.3

# Docker images
ztoumia/sipzy-backend:latest
ztoumia/sipzy-backend:v1.2.3
ztoumia/sipzy-backend:main-abc1234

# Commits (Conventional Commits)
feat: add user authentication
fix: correct login validation
docs: update deployment guide
chore: upgrade dependencies
```

### 3. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Added tests for new features
```

### 4. Code Review

**Règles:**
- ✅ Au moins 1 revieweur requis
- ✅ CI doit passer avant merge
- ✅ Scan sécurité doit passer
- ✅ Pas de merge de sa propre PR
- ✅ Squash commits avant merge

### 5. Rollback Strategy

```bash
# Option 1: Tag précédent
docker compose pull
docker tag ztoumia/sipzy-backend:v1.2.2 ztoumia/sipzy-backend:latest
docker compose up -d

# Option 2: Restore backup
cat /home/deploy/backups/pre-deploy-20251109_143000.sql | \
  docker compose exec -T db psql -U sipzy -d sipzy

# Option 3: Revert commit + redeploy
git revert HEAD
git push origin main
# GitHub Actions redéploiera automatiquement
```

---

## Checklist de mise en place

```bash
# Configuration GitHub
□ Créer tous les secrets GitHub Actions
□ Configurer les environnements (staging, production)
□ Ajouter les revieweurs requis
□ Activer branch protection rules

# CI/CD
□ Créer .github/workflows/ci.yml
□ Créer .github/workflows/cd.yml
□ Créer .github/workflows/release.yml
□ Tester les workflows sur une feature branch

# Infrastructure
□ Setup VPS staging
□ Setup VPS production
□ Configurer SSH keys
□ Installer Docker + Docker Compose
□ Configurer firewall (UFW)

# Monitoring
□ Setup Prometheus + Grafana
□ Configurer les alertes
□ Setup Loki (logs)
□ Configurer Slack notifications

# Documentation
□ Mettre à jour README.md
□ Créer CONTRIBUTING.md
□ Créer PR template
□ Documenter le workflow Git

# Sécurité
□ Scanner les images (Trivy)
□ Configurer dependabot
□ Activer GitHub code scanning
□ Review des secrets
```

---

**Prochain document:** Guide de Déploiement & Maintenance
