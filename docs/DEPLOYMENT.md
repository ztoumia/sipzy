# Guide de Déploiement Sipzy sur VPS

**Date:** 2025-10-29
**Objectif:** Documentation complète pour le déploiement de Sipzy sur VPS via GitHub Actions

---

## Table des matières

1. [Architecture de Déploiement](#architecture-de-déploiement)
2. [Configuration Docker](#configuration-docker)
3. [Configuration Nginx](#configuration-nginx)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [Scripts de Setup](#scripts-de-setup)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Procédure de Déploiement](#procédure-de-déploiement)
8. [Monitoring et Maintenance](#monitoring-et-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    VPS Ubuntu 22.04                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                   Nginx (80/443)                  │ │
│  │         Reverse Proxy + SSL + Load Balancer       │ │
│  └───────────────┬───────────────┬───────────────────┘ │
│                  │               │                     │
│  ┌───────────────▼──────┐ ┌─────▼──────────────────┐  │
│  │  Frontend Container  │ │  Backend Container     │  │
│  │  Next.js (3000)      │ │  Spring Boot (8080)    │  │
│  │  - Static files      │ │  - REST API            │  │
│  │  - SSR               │ │  - Business logic      │  │
│  └──────────────────────┘ └────────┬───────────────┘  │
│                                     │                  │
│                          ┌──────────▼───────────────┐  │
│                          │  PostgreSQL Container    │  │
│                          │  (5432)                  │  │
│                          └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Composants

- **Nginx**: Reverse proxy, SSL/TLS, cache statique, rate limiting
- **Frontend**: Application Next.js avec SSR
- **Backend**: API Spring Boot
- **PostgreSQL**: Base de données relationnelle
- **Certbot**: Gestion automatique des certificats SSL

---

## Configuration Docker

### Backend Dockerfile

**Fichier:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### Frontend Dockerfile

**Fichier:** `frontend/Dockerfile`

```dockerfile
# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js app
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose Production

**Fichier:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sipzy-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - sipzy-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sipzy-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      SPRING_MAIL_HOST: ${MAIL_HOST}
      SPRING_MAIL_PORT: ${MAIL_PORT}
      SPRING_MAIL_USERNAME: ${MAIL_USERNAME}
      SPRING_MAIL_PASSWORD: ${MAIL_PASSWORD}
    networks:
      - sipzy-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sipzy-frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      NEXT_PUBLIC_CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
    networks:
      - sipzy-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: sipzy-nginx
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - sipzy-network
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"

  certbot:
    image: certbot/certbot
    container_name: sipzy-certbot
    restart: unless-stopped
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  sipzy-network:
    driver: bridge

volumes:
  postgres-data:
```

---

## Configuration Nginx

### nginx.conf Principal

**Fichier:** `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    include /etc/nginx/sites-enabled/*;
}
```

### Configuration Sites

**Fichier:** `nginx/sites-enabled/sipzy.conf`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sipzy.com www.sipzy.com api.sipzy.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Frontend - sipzy.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sipzy.com www.sipzy.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/sipzy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sipzy.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Static files cache
    location /_next/static/ {
        proxy_pass http://frontend:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.sipzy.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.sipzy.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.sipzy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sipzy.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://backend:8080;
        include /etc/nginx/proxy_params;
    }

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin "https://sipzy.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

---

## GitHub Actions CI/CD

### Backend Deployment Workflow

**Fichier:** `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend to VPS

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Run tests
        working-directory: ./backend
        run: mvn clean test

      - name: Build JAR
        working-directory: ./backend
        run: mvn package -DskipTests

  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: test

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

      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          # Copy files to VPS
          scp -r ./backend $VPS_USER@$VPS_HOST:/home/$VPS_USER/sipzy/
          scp ./docker-compose.prod.yml $VPS_USER@$VPS_HOST:/home/$VPS_USER/sipzy/

          # Deploy on VPS
          ssh $VPS_USER@$VPS_HOST << 'EOF'
            cd /home/$VPS_USER/sipzy

            # Create .env file
            cat > .env << EOL
            POSTGRES_DB=${{ secrets.POSTGRES_DB }}
            POSTGRES_USER=${{ secrets.POSTGRES_USER }}
            POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
            CLOUDINARY_CLOUD_NAME=${{ secrets.CLOUDINARY_CLOUD_NAME }}
            CLOUDINARY_API_KEY=${{ secrets.CLOUDINARY_API_KEY }}
            CLOUDINARY_API_SECRET=${{ secrets.CLOUDINARY_API_SECRET }}
            MAIL_HOST=${{ secrets.MAIL_HOST }}
            MAIL_PORT=${{ secrets.MAIL_PORT }}
            MAIL_USERNAME=${{ secrets.MAIL_USERNAME }}
            MAIL_PASSWORD=${{ secrets.MAIL_PASSWORD }}
            NEXT_PUBLIC_API_URL=https://api.sipzy.com/api
            EOL

            # Build and restart backend
            docker-compose -f docker-compose.prod.yml build backend
            docker-compose -f docker-compose.prod.yml up -d backend

            # Wait for health check
            sleep 30

            # Check if backend is healthy
            if ! docker ps | grep -q sipzy-backend; then
              echo "Backend deployment failed!"
              docker-compose -f docker-compose.prod.yml logs backend
              exit 1
            fi

            echo "Backend deployed successfully!"
          EOF

      - name: Notify deployment success
        if: success()
        run: echo "Backend deployed successfully to VPS!"

      - name: Notify deployment failure
        if: failure()
        run: echo "Backend deployment failed!"
```

### Frontend Deployment Workflow

**Fichier:** `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend to VPS

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

jobs:
  test:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run linting
        working-directory: ./frontend
        run: npm run lint

      - name: Build application
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: https://api.sipzy.com/api
        run: npm run build

  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: test

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

      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          # Copy files to VPS
          scp -r ./frontend $VPS_USER@$VPS_HOST:/home/$VPS_USER/sipzy/
          scp ./docker-compose.prod.yml $VPS_USER@$VPS_HOST:/home/$VPS_USER/sipzy/

          # Deploy on VPS
          ssh $VPS_USER@$VPS_HOST << 'EOF'
            cd /home/$VPS_USER/sipzy

            # Build and restart frontend
            docker-compose -f docker-compose.prod.yml build frontend
            docker-compose -f docker-compose.prod.yml up -d frontend

            # Wait for health check
            sleep 30

            # Check if frontend is healthy
            if ! docker ps | grep -q sipzy-frontend; then
              echo "Frontend deployment failed!"
              docker-compose -f docker-compose.prod.yml logs frontend
              exit 1
            fi

            # Reload Nginx
            docker-compose -f docker-compose.prod.yml exec -T nginx nginx -s reload

            echo "Frontend deployed successfully!"
          EOF

      - name: Notify deployment success
        if: success()
        run: echo "Frontend deployed successfully to VPS!"

      - name: Notify deployment failure
        if: failure()
        run: echo "Frontend deployment failed!"
```

---

## Scripts de Setup

### Script d'Initialisation VPS

**Fichier:** `scripts/setup-vps.sh`

```bash
#!/bin/bash

# Script d'initialisation du VPS pour Sipzy
# À exécuter en tant que root

set -e

echo "=== Sipzy VPS Setup ==="

# 1. Mise à jour du système
echo "📦 Updating system..."
apt-get update
apt-get upgrade -y

# 2. Installation des dépendances
echo "📦 Installing dependencies..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    fail2ban

# 3. Installation de Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Installation de Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Création de l'utilisateur deploy
echo "👤 Creating deploy user..."
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# 5. Configuration du firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# 6. Configuration de fail2ban
echo "🛡️  Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# 7. Création de la structure de dossiers
echo "📁 Creating directory structure..."
mkdir -p /home/deploy/sipzy/{backend,frontend,nginx,certbot}
mkdir -p /home/deploy/sipzy/nginx/sites-enabled
mkdir -p /home/deploy/sipzy/certbot/{conf,www}
chown -R deploy:deploy /home/deploy/sipzy

# 8. Configuration SSH pour deploy user
echo "🔑 Setting up SSH for deploy user..."
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

echo "✅ VPS setup completed!"
echo ""
echo "Next steps:"
echo "1. Add your GitHub Actions public key to /home/deploy/.ssh/authorized_keys"
echo "2. Copy nginx configuration files to /home/deploy/sipzy/nginx/"
echo "3. Run certbot to get SSL certificates"
echo "4. Deploy using GitHub Actions"
```

### Script d'Initialisation SSL

**Fichier:** `scripts/init-ssl.sh`

```bash
#!/bin/bash

# Script d'initialisation SSL avec Let's Encrypt
# À exécuter en tant qu'utilisateur deploy

set -e

DOMAIN="sipzy.com"
EMAIL="admin@sipzy.com"

echo "=== Initializing SSL for $DOMAIN ==="

cd /home/deploy/sipzy

# Arrêter nginx si en cours d'exécution
docker-compose -f docker-compose.prod.yml stop nginx || true

# Obtenir les certificats
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d api.$DOMAIN

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml up -d nginx

echo "✅ SSL certificates obtained successfully!"
```

---

## Variables d'Environnement

### Secrets GitHub Actions

Configurer dans **Settings > Secrets and variables > Actions:**

```
VPS_HOST=your-vps-ip
VPS_USER=deploy
VPS_SSH_KEY=<private-ssh-key>

POSTGRES_DB=sipzy_db
POSTGRES_USER=sipzy_user
POSTGRES_PASSWORD=<secure-password>

JWT_SECRET=<secure-jwt-secret>

CLOUDINARY_CLOUD_NAME=sipzy
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your-email>
MAIL_PASSWORD=<your-app-password>
```

---

## Procédure de Déploiement

### 1. Configuration Initiale VPS

```bash
# Sur votre machine locale
ssh root@your-vps-ip

# Sur le VPS
curl -O https://raw.githubusercontent.com/your-repo/sipzy/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh

# Ajouter la clé SSH de GitHub Actions
nano /home/deploy/.ssh/authorized_keys
# Coller la clé publique
```

### 2. Configuration Nginx

```bash
# Copier les fichiers nginx
scp -r nginx/* deploy@your-vps-ip:/home/deploy/sipzy/nginx/
```

### 3. Configuration SSL

```bash
ssh deploy@your-vps-ip
cd /home/deploy/sipzy
curl -O https://raw.githubusercontent.com/your-repo/sipzy/main/scripts/init-ssl.sh
chmod +x init-ssl.sh
./init-ssl.sh
```

### 4. Premier Déploiement

```bash
# Depuis votre machine locale
git push origin main
# GitHub Actions va automatiquement déployer
```

### 5. Vérification

```bash
# Vérifier les containers
docker ps

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Test HTTPS
curl https://sipzy.com
curl https://api.sipzy.com/api/health
```

---

## Monitoring et Maintenance

### Commandes Utiles

```bash
# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Voir l'état des services
docker-compose -f docker-compose.prod.yml ps

# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a
```

### Backup Base de Données

```bash
# Créer un backup
docker exec sipzy-postgres pg_dump -U sipzy_user sipzy_db > backup_$(date +%Y%m%d).sql

# Restaurer un backup
cat backup_20251029.sql | docker exec -i sipzy-postgres psql -U sipzy_user -d sipzy_db
```

---

## Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs backend

# Vérifier la connexion DB
docker-compose -f docker-compose.prod.yml exec backend \
  wget --spider http://postgres:5432

# Redémarrer avec rebuild
docker-compose -f docker-compose.prod.yml up -d --build backend
```

### Frontend ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs frontend

# Vérifier les variables d'env
docker-compose -f docker-compose.prod.yml exec frontend env | grep NEXT

# Rebuild
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Site inaccessible

```bash
# Vérifier nginx
docker-compose -f docker-compose.prod.yml logs nginx

# Tester la configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Vérifier les ports
netstat -tulpn | grep -E '80|443'
```

---

**Document créé le:** 2025-10-29
**Version:** 1.0
