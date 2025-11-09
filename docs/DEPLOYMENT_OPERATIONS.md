# Guide de Déploiement & Maintenance - Sipzy

**Date:** 2025-11-09
**Version:** 1.0
**Auteur:** DevOps Expert Agent

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Setup initial](#setup-initial)
3. [Procédures de déploiement](#procédures-de-déploiement)
4. [Opérations courantes](#opérations-courantes)
5. [Monitoring et alerting](#monitoring-et-alerting)
6. [Backup et restauration](#backup-et-restauration)
7. [Troubleshooting](#troubleshooting)
8. [Runbook d'incident](#runbook-dincident)
9. [Maintenance](#maintenance)
10. [Annexes](#annexes)

---

## Prérequis

### Infrastructure requise

#### VPS Production
```
Spécifications minimales:
├── CPU: 2 vCPU (4 vCPU recommandé)
├── RAM: 4 GB (8 GB recommandé)
├── Disque: 50 GB SSD (100 GB recommandé)
├── OS: Ubuntu 22.04 LTS
└── Réseau: IPv4 publique statique
```

#### VPS Staging (optionnel)
```
Spécifications minimales:
├── CPU: 1 vCPU
├── RAM: 2 GB
├── Disque: 30 GB SSD
└── OS: Ubuntu 22.04 LTS
```

### Logiciels requis

**Sur le VPS:**
```bash
├── Docker Engine 24.0+
├── Docker Compose 2.20+
├── Nginx (via Docker)
├── Certbot (via Docker)
├── UFW (Firewall)
└── Fail2ban
```

**Sur la machine locale:**
```bash
├── Git
├── SSH client
├── Docker (pour build local)
└── OpenSSL (pour générer secrets)
```

### Accès requis

```
Accès nécessaires:
├── GitHub Repository (admin access)
├── Docker Hub account
├── VPS SSH access (root ou sudo)
├── Domaine DNS (sipzy.com)
├── Cloudinary account (optionnel)
└── SMTP server (optionnel)
```

---

## Setup initial

### 1. Configuration du VPS

#### Étape 1: Connexion initiale

```bash
# Se connecter en tant que root
ssh root@YOUR_VPS_IP

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les outils de base
apt install -y curl wget git vim ufw fail2ban
```

#### Étape 2: Sécurisation du VPS

```bash
# Créer un utilisateur deploy
adduser deploy
usermod -aG sudo deploy

# Configurer SSH
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Ajouter votre clé SSH publique
# Option 1: Copier depuis votre machine
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@YOUR_VPS_IP

# Option 2: Manuellement
nano /home/deploy/.ssh/authorized_keys
# Coller votre clé publique

# Désactiver l'authentification par mot de passe (recommandé)
nano /etc/ssh/sshd_config
# Modifier:
#   PasswordAuthentication no
#   PermitRootLogin no

# Redémarrer SSH
systemctl restart sshd

# Tester la connexion SSH avec le nouvel utilisateur
# Depuis votre machine:
ssh deploy@YOUR_VPS_IP
```

#### Étape 3: Configurer le firewall

```bash
# Configuration UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Vérifier le statut
sudo ufw status verbose
```

#### Étape 4: Installer Docker

```bash
# Script d'installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Ajouter deploy au groupe docker
sudo usermod -aG docker deploy

# Déconnecter/reconnecter pour appliquer
exit
ssh deploy@YOUR_VPS_IP

# Vérifier Docker
docker --version
docker ps

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier Docker Compose
docker-compose --version
```

#### Étape 5: Configurer Fail2ban

```bash
# Copier la configuration par défaut
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Éditer la configuration
sudo nano /etc/fail2ban/jail.local

# Configuration recommandée pour SSH:
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

# Redémarrer Fail2ban
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Vérifier le statut
sudo fail2ban-client status sshd
```

### 2. Configuration DNS

```bash
# Configurer vos enregistrements DNS

Type    Name        Value                TTL
────────────────────────────────────────────────
A       @           YOUR_VPS_IP          3600
A       www         YOUR_VPS_IP          3600
A       api         YOUR_VPS_IP          3600
A       admin       YOUR_VPS_IP          3600 (si backoffice)
CNAME   staging     staging.sipzy.com    3600 (si staging)
```

**Vérifier la propagation DNS:**
```bash
# Sur votre machine locale
dig sipzy.com +short
dig www.sipzy.com +short
dig api.sipzy.com +short

# Ou avec nslookup
nslookup sipzy.com
```

### 3. Structure des dossiers

```bash
# Créer la structure de dossiers
mkdir -p ~/sipzy/{backend,frontend,backoffice,nginx,certbot,backups,logs}
mkdir -p ~/sipzy/nginx/sites-enabled
mkdir -p ~/sipzy/certbot/{conf,www}

# Structure finale:
~/sipzy/
├── backend/
├── frontend/
├── backoffice/
├── nginx/
│   ├── nginx.conf
│   └── sites-enabled/
│       └── sipzy.conf
├── certbot/
│   ├── conf/        # Certificats SSL
│   └── www/         # Challenge ACME
├── backups/         # Backups PostgreSQL
├── logs/            # Logs applicatifs
├── .env             # Variables d'environnement
└── docker-compose.yml
```

### 4. Configuration des secrets

```bash
# Générer des secrets forts
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
PGADMIN_PASSWORD=$(openssl rand -base64 32)

# Créer le fichier .env
cat > ~/sipzy/.env << EOF
# Docker Registry
DOCKER_REGISTRY=ztoumia
BACKEND_VERSION=latest
FRONTEND_VERSION=latest
BACKOFFICE_VERSION=latest

# Database
POSTGRES_DB=sipzy
POSTGRES_USER=sipzy
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Backend
BACKEND_PORT=8080
SPRING_PROFILE=prod
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=604800000

# CORS
CORS_ALLOWED_ORIGINS=https://sipzy.com,https://www.sipzy.com,https://admin.sipzy.com

# Cloudinary (Optionnel)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Optionnel)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=https://api.sipzy.com

# Backoffice
BACKOFFICE_PORT=3001
NEXT_PUBLIC_SITE_URL=https://sipzy.com
EOF

# Sécuriser le fichier
chmod 600 ~/sipzy/.env

# Afficher les secrets générés (à sauvegarder dans un gestionnaire de mots de passe)
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
echo "JWT_SECRET: $JWT_SECRET"
```

### 5. Configuration Nginx

#### Créer nginx.conf

```bash
cat > ~/sipzy/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
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
    client_max_body_size 50M;

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
EOF
```

#### Créer la configuration du site

```bash
cat > ~/sipzy/nginx/sites-enabled/sipzy.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sipzy.com www.sipzy.com api.sipzy.com admin.sipzy.com;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Frontend - sipzy.com & www.sipzy.com
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

    # Logs
    access_log /var/log/nginx/frontend-access.log;
    error_log /var/log/nginx/frontend-error.log;

    # Static files cache
    location /_next/static/ {
        proxy_pass http://frontend:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Main application
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
        proxy_read_timeout 90;
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

    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    # Rate limiting on login endpoint
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        limit_req_status 429;

        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # API endpoints
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;

        # CORS headers (si besoin)
        add_header Access-Control-Allow-Origin "https://sipzy.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}

# Backoffice Admin - admin.sipzy.com
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.sipzy.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/admin.sipzy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.sipzy.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logs
    access_log /var/log/nginx/backoffice-access.log;
    error_log /var/log/nginx/backoffice-error.log;

    # Static files cache
    location /_next/static/ {
        proxy_pass http://backoffice:3001;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://backoffice:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
EOF
```

### 6. Obtenir les certificats SSL

```bash
# Arrêter tous les services utilisant les ports 80/443
sudo systemctl stop nginx || true
docker compose down || true

# Obtenir les certificats pour tous les domaines
docker run --rm \
  -v ~/sipzy/certbot/conf:/etc/letsencrypt \
  -v ~/sipzy/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email votre-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d sipzy.com \
  -d www.sipzy.com \
  -d api.sipzy.com \
  -d admin.sipzy.com

# Vérifier les certificats
sudo ls -la ~/sipzy/certbot/conf/live/
```

### 7. Créer docker-compose.prod.yml

```bash
# Copier depuis le repo ou créer
cd ~/sipzy
git clone https://github.com/ztoumia/sipzy.git tmp
cp tmp/docker-compose.yml docker-compose.prod.yml
rm -rf tmp

# Ou télécharger directement
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/ztoumia/sipzy/main/docker-compose.yml

# Éditer pour la production
nano docker-compose.prod.yml
# Ajuster:
# - Ne pas exposer PostgreSQL sur 5432
# - Utiliser des images du registry au lieu de build
# - Ajouter Nginx service
```

### 8. Premier déploiement

```bash
cd ~/sipzy

# Pull les images
docker compose -f docker-compose.prod.yml pull

# Démarrer les services
docker compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier que tout fonctionne
docker compose -f docker-compose.prod.yml ps

# Tester les endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:3000
curl http://localhost:3001
```

---

## Procédures de déploiement

### Déploiement manuel

```bash
# 1. Se connecter au VPS
ssh deploy@YOUR_VPS_IP

# 2. Aller dans le dossier
cd ~/sipzy

# 3. Backup de la base de données (IMPORTANT!)
docker compose exec -T db pg_dump -U sipzy sipzy > \
  ~/sipzy/backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql

# 4. Pull les nouvelles images
docker compose -f docker-compose.prod.yml pull

# 5. Redémarrer les services (avec downtime)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 6. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# 7. Health check
sleep 30
curl http://localhost:8080/actuator/health
curl http://localhost:3000

# 8. Vérifier HTTPS
curl https://sipzy.com
curl https://api.sipzy.com/actuator/health
```

### Déploiement rolling (zero downtime)

```bash
# 1. Backup
docker compose exec -T db pg_dump -U sipzy sipzy > \
  ~/sipzy/backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql

# 2. Pull images
docker compose -f docker-compose.prod.yml pull

# 3. Redémarrer service par service
docker compose -f docker-compose.prod.yml up -d --no-deps db
sleep 10

docker compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 20
curl http://localhost:8080/actuator/health || exit 1

docker compose -f docker-compose.prod.yml up -d --no-deps frontend
sleep 10
curl http://localhost:3000 || exit 1

docker compose -f docker-compose.prod.yml up -d --no-deps backoffice
sleep 10

# 4. Recharger Nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# 5. Vérifier
docker compose -f docker-compose.prod.yml ps
```

### Déploiement via GitHub Actions

**Configuration:**
```bash
# 1. Ajouter la clé SSH dans GitHub Secrets
cat ~/.ssh/id_ed25519  # Sur votre machine locale
# Copier la clé privée dans GitHub: Settings > Secrets > VPS_SSH_KEY

# 2. Ajouter les autres secrets
# VPS_HOST=YOUR_VPS_IP
# VPS_USER=deploy
# ... (voir CICD_STRATEGY.md)

# 3. Push sur main
git push origin main

# GitHub Actions déploiera automatiquement
```

---

## Opérations courantes

### Gestion des services

```bash
# Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Arrêter tous les services
docker compose -f docker-compose.prod.yml down

# Redémarrer un service spécifique
docker compose -f docker-compose.prod.yml restart backend

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend --tail=100

# Voir le statut
docker compose -f docker-compose.prod.yml ps

# Statistiques en temps réel
docker stats
```

### Accès aux containers

```bash
# Shell dans le backend
docker compose -f docker-compose.prod.yml exec backend sh

# Shell dans PostgreSQL
docker compose -f docker-compose.prod.yml exec db psql -U sipzy -d sipzy

# Shell dans le frontend
docker compose -f docker-compose.prod.yml exec frontend sh

# Exécuter une commande ponctuelle
docker compose -f docker-compose.prod.yml exec backend java --version
```

### Mise à jour des images

```bash
# Pull toutes les images
docker compose -f docker-compose.prod.yml pull

# Pull une image spécifique
docker compose -f docker-compose.prod.yml pull backend

# Rebuild une image localement (si nécessaire)
docker compose -f docker-compose.prod.yml build --no-cache backend
```

### Gestion des volumes

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect sipzy-postgres-data

# Backup d'un volume (PostgreSQL)
docker run --rm -v sipzy-postgres-data:/data -v ~/sipzy/backups:/backup \
  alpine tar czf /backup/postgres-volume-$(date +%Y%m%d).tar.gz -C /data .

# Nettoyer les volumes inutilisés (ATTENTION!)
docker volume prune
```

### Nettoyage

```bash
# Nettoyer les containers arrêtés
docker container prune -f

# Nettoyer les images inutilisées
docker image prune -a -f

# Nettoyer tout (ATTENTION: arrête tout!)
docker system prune -a --volumes

# Voir l'espace disque utilisé
docker system df
```

---

## Monitoring et alerting

### Health checks manuels

```bash
# Script de health check
cat > ~/sipzy/scripts/health-check.sh << 'EOF'
#!/bin/bash

echo "=== Health Check ==="
echo ""

# Backend
echo -n "Backend: "
if curl -sf http://localhost:8080/actuator/health > /dev/null; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# Frontend
echo -n "Frontend: "
if curl -sf http://localhost:3000 > /dev/null; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# Backoffice
echo -n "Backoffice: "
if curl -sf http://localhost:3001 > /dev/null; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# Database
echo -n "Database: "
if docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db pg_isready -U sipzy > /dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# SSL Expiration
echo ""
echo "=== SSL Certificates ==="
for domain in sipzy.com api.sipzy.com admin.sipzy.com; do
  EXPIRY=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | \
    openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  echo "$domain: $EXPIRY"
done
EOF

chmod +x ~/sipzy/scripts/health-check.sh
```

### Monitoring des logs

```bash
# Logs en temps réel avec filtre
docker compose -f docker-compose.prod.yml logs -f | grep ERROR

# Logs backend avec timestamp
docker compose -f docker-compose.prod.yml logs -f --timestamps backend

# Logs des 10 dernières minutes
docker compose -f docker-compose.prod.yml logs --since 10m

# Logs d'un service entre deux dates
docker compose -f docker-compose.prod.yml logs \
  --since "2025-11-09T10:00:00" \
  --until "2025-11-09T11:00:00" \
  backend
```

### Monitoring des ressources

```bash
# Utilisation CPU/RAM en temps réel
docker stats

# Utilisation disque
df -h
docker system df

# Logs Nginx
tail -f ~/sipzy/logs/nginx/access.log
tail -f ~/sipzy/logs/nginx/error.log

# Processus système
htop
```

### Setup d'alerting (optionnel)

```bash
# Script d'alerte simple
cat > ~/sipzy/scripts/alert.sh << 'EOF'
#!/bin/bash

# Configuration
WEBHOOK_URL="YOUR_SLACK_WEBHOOK_URL"
ALERT_EMAIL="admin@sipzy.com"

send_slack_alert() {
  local message=$1
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"⚠️ Sipzy Alert: $message\"}" \
    $WEBHOOK_URL
}

send_email_alert() {
  local message=$1
  echo "$message" | mail -s "Sipzy Alert" $ALERT_EMAIL
}

# Health checks
if ! curl -sf http://localhost:8080/actuator/health > /dev/null; then
  send_slack_alert "Backend is down!"
  send_email_alert "Backend is down!"
fi

# Disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
  send_slack_alert "Disk usage is at ${DISK_USAGE}%"
fi
EOF

chmod +x ~/sipzy/scripts/alert.sh

# Ajouter au cron (toutes les 5 minutes)
crontab -e
# Ajouter:
# */5 * * * * /home/deploy/sipzy/scripts/alert.sh
```

---

## Backup et restauration

### Backup PostgreSQL

#### Backup manuel

```bash
# Backup complet
docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  pg_dump -U sipzy sipzy > ~/sipzy/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup compressé
docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  pg_dump -U sipzy sipzy | gzip > ~/sipzy/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup d'une table spécifique
docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  pg_dump -U sipzy -t users sipzy > ~/sipzy/backups/users_$(date +%Y%m%d).sql
```

#### Backup automatique

```bash
# Script de backup automatique
cat > ~/sipzy/scripts/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/deploy/sipzy/backups"
BACKUP_FILE="$BACKUP_DIR/auto_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
MAX_BACKUPS=7  # Garder 7 jours de backups

# Créer le backup
docker compose -f /home/deploy/sipzy/docker-compose.prod.yml exec -T db \
  pg_dump -U sipzy sipzy | gzip > "$BACKUP_FILE"

# Vérifier le succès
if [ $? -eq 0 ]; then
  echo "✅ Backup créé: $BACKUP_FILE"

  # Supprimer les anciens backups
  find "$BACKUP_DIR" -name "auto_backup_*.sql.gz" -mtime +$MAX_BACKUPS -delete
  echo "✅ Anciens backups nettoyés"
else
  echo "❌ Erreur lors du backup"
  exit 1
fi
EOF

chmod +x ~/sipzy/scripts/backup-db.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter:
# 0 2 * * * /home/deploy/sipzy/scripts/backup-db.sh >> /home/deploy/sipzy/logs/backup.log 2>&1
```

### Restauration PostgreSQL

```bash
# Restaurer depuis un backup
cat ~/sipzy/backups/backup_20251109_140000.sql | \
  docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  psql -U sipzy -d sipzy

# Restaurer depuis un backup compressé
gunzip -c ~/sipzy/backups/backup_20251109_140000.sql.gz | \
  docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  psql -U sipzy -d sipzy

# Restaurer en recréant la base (ATTENTION: efface tout!)
docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  dropdb -U sipzy sipzy
docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  createdb -U sipzy sipzy
cat ~/sipzy/backups/backup_20251109_140000.sql | \
  docker compose -f ~/sipzy/docker-compose.prod.yml exec -T db \
  psql -U sipzy -d sipzy
```

### Backup complet du système

```bash
# Backup de tous les volumes et configs
tar -czf ~/sipzy-full-backup-$(date +%Y%m%d).tar.gz \
  ~/sipzy/.env \
  ~/sipzy/docker-compose.prod.yml \
  ~/sipzy/nginx/ \
  ~/sipzy/backups/ \
  ~/sipzy/certbot/conf/

# Backup des volumes Docker
docker run --rm \
  -v sipzy-postgres-data:/data \
  -v ~/sipzy/backups:/backup \
  alpine tar czf /backup/postgres-volume-$(date +%Y%m%d).tar.gz -C /data .
```

---

## Troubleshooting

### Backend ne démarre pas

**Symptôme:** Backend container arrête immédiatement

```bash
# 1. Voir les logs
docker compose -f docker-compose.prod.yml logs backend

# 2. Vérifier les variables d'environnement
docker compose -f docker-compose.prod.yml exec backend env | grep -E 'DATABASE|JWT|SPRING'

# 3. Vérifier la connexion à la base
docker compose -f docker-compose.prod.yml exec db \
  psql -U sipzy -d sipzy -c "SELECT version();"

# 4. Tester manuellement
docker compose -f docker-compose.prod.yml run --rm backend sh
# Dans le container:
java -jar app.jar --spring.profiles.active=prod

# Solutions courantes:
# - Vérifier DATABASE_URL
# - Vérifier JWT_SECRET (minimum 256 bits)
# - Vérifier que PostgreSQL est healthy
# - Vérifier les migrations Flyway/Liquibase
```

### Frontend ne démarre pas

**Symptôme:** Frontend container arrête ou erreur 500

```bash
# 1. Voir les logs
docker compose -f docker-compose.prod.yml logs frontend

# 2. Vérifier les variables d'environnement
docker compose -f docker-compose.prod.yml exec frontend env | grep NEXT

# 3. Vérifier le build
docker compose -f docker-compose.prod.yml exec frontend ls -la .next/

# 4. Tester manuellement
docker compose -f docker-compose.prod.yml run --rm frontend sh
# Dans le container:
node server.js

# Solutions courantes:
# - Vérifier NEXT_PUBLIC_API_URL
# - Rebuild l'image: docker compose build --no-cache frontend
# - Vérifier les permissions: chown nextjs:nodejs /app
```

### PostgreSQL ne démarre pas

**Symptôme:** Database container ne démarre pas ou health check échoue

```bash
# 1. Voir les logs
docker compose -f docker-compose.prod.yml logs db

# 2. Vérifier le volume
docker volume inspect sipzy-postgres-data

# 3. Vérifier les permissions
docker compose -f docker-compose.prod.yml exec db ls -la /var/lib/postgresql/data

# Solutions courantes:
# - Corriger POSTGRES_USER/POSTGRES_PASSWORD
# - Supprimer le volume et recréer (PERTE DE DONNÉES!)
#   docker volume rm sipzy-postgres-data
#   docker compose up -d db
# - Restaurer depuis un backup
```

### Nginx erreur 502 Bad Gateway

**Symptôme:** Nginx retourne 502 au lieu de servir l'app

```bash
# 1. Vérifier que les containers tournent
docker compose -f docker-compose.prod.yml ps

# 2. Tester les backends directement
curl http://localhost:3000  # Frontend
curl http://localhost:8080/actuator/health  # Backend

# 3. Vérifier la config Nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# 4. Voir les logs Nginx
docker compose -f docker-compose.prod.yml logs nginx

# Solutions courantes:
# - Attendre que les services démarrent (start_period)
# - Vérifier les noms de services dans nginx.conf
# - Vérifier le réseau Docker: docker network inspect sipzy-network
# - Redémarrer Nginx: docker compose restart nginx
```

### Certificat SSL expiré

**Symptôme:** HTTPS ne fonctionne plus, erreur de certificat

```bash
# 1. Vérifier l'expiration
echo | openssl s_client -servername sipzy.com -connect sipzy.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# 2. Renouveler manuellement
docker run --rm \
  -v ~/sipzy/certbot/conf:/etc/letsencrypt \
  -v ~/sipzy/certbot/www:/var/www/certbot \
  certbot/certbot renew

# 3. Redémarrer Nginx
docker compose -f docker-compose.prod.yml restart nginx

# 4. Automatiser le renouvellement
crontab -e
# Ajouter:
# 0 0 1 * * docker run --rm -v ~/sipzy/certbot/conf:/etc/letsencrypt -v ~/sipzy/certbot/www:/var/www/certbot certbot/certbot renew && docker compose -f ~/sipzy/docker-compose.prod.yml restart nginx
```

### Out of Memory (OOM)

**Symptôme:** Containers s'arrêtent aléatoirement

```bash
# 1. Vérifier les logs système
dmesg | grep -i "killed process"
journalctl -u docker.service | grep -i "oom"

# 2. Voir l'utilisation mémoire
free -h
docker stats

# 3. Identifier le coupable
docker stats --no-stream

# Solutions:
# - Augmenter la RAM du VPS
# - Limiter la mémoire des containers
docker compose -f docker-compose.prod.yml exec backend sh -c 'echo $JAVA_OPTS'
# Réduire -Xmx512m à -Xmx256m

# - Ajouter du swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Disk full

**Symptôme:** Plus d'espace disque

```bash
# 1. Voir l'utilisation
df -h
du -sh ~/sipzy/*

# 2. Nettoyer Docker
docker system prune -a -f --volumes
docker image prune -a -f

# 3. Nettoyer les logs
truncate -s 0 ~/sipzy/logs/*.log
find ~/sipzy/logs -name "*.log" -mtime +30 -delete

# 4. Nettoyer les backups
find ~/sipzy/backups -name "*.sql" -mtime +30 -delete

# 5. Limiter les logs Docker
# Éditer docker-compose.prod.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Runbook d'incident

### Incident: Site down

```
1. VÉRIFICATION (2 min)
   □ Vérifier que le site est vraiment down
     curl https://sipzy.com
     curl https://api.sipzy.com/actuator/health

   □ Vérifier les containers
     ssh deploy@VPS
     docker compose -f ~/sipzy/docker-compose.prod.yml ps

2. DIAGNOSTIC (5 min)
   □ Consulter les logs
     docker compose logs --tail=100 backend frontend nginx

   □ Vérifier les ressources
     docker stats
     df -h
     free -h

3. ACTION RAPIDE (2 min)
   □ Redémarrage rapide
     docker compose restart backend frontend

   □ Si ça ne marche pas, redémarrage complet
     docker compose down && docker compose up -d

4. COMMUNICATION (immédiat)
   □ Poster sur Slack/Discord/Status page
     "Site en maintenance, résolution en cours"

5. ROLLBACK SI NÉCESSAIRE (5 min)
   □ Restaurer la version précédente
     docker pull ztoumia/sipzy-backend:previous-tag
     docker compose up -d

6. POST-MORTEM
   □ Documenter l'incident
   □ Identifier la cause racine
   □ Mettre en place des mesures préventives
```

### Incident: Database corruption

```
1. ARRÊT IMMÉDIAT
   □ Arrêter tous les services
     docker compose stop backend frontend backoffice

   □ Garder seulement PostgreSQL
     docker compose ps

2. VÉRIFICATION
   □ Tenter de se connecter
     docker compose exec db psql -U sipzy -d sipzy

   □ Vérifier l'intégrité
     docker compose exec db pg_dump -U sipzy sipzy > /tmp/test.sql

3. RESTAURATION
   □ Si backup récent existe:
     # Recréer la base
     docker compose exec db dropdb -U sipzy sipzy
     docker compose exec db createdb -U sipzy sipzy

     # Restaurer
     cat ~/sipzy/backups/backup_LATEST.sql | \
       docker compose exec -T db psql -U sipzy -d sipzy

   □ Redémarrer les services
     docker compose up -d

4. PRÉVENTION
   □ Augmenter la fréquence des backups
   □ Setup monitoring de l'intégrité DB
```

---

## Maintenance

### Maintenance hebdomadaire

```bash
# Lundi 2h00 AM
0 2 * * 1 /home/deploy/sipzy/scripts/weekly-maintenance.sh

# Script: ~/sipzy/scripts/weekly-maintenance.sh
#!/bin/bash

echo "=== Weekly Maintenance $(date) ===" | tee -a ~/sipzy/logs/maintenance.log

# 1. Backup
echo "Creating backup..." | tee -a ~/sipzy/logs/maintenance.log
/home/deploy/sipzy/scripts/backup-db.sh

# 2. Cleanup Docker
echo "Cleaning Docker..." | tee -a ~/sipzy/logs/maintenance.log
docker image prune -a -f
docker volume prune -f
docker network prune -f

# 3. Update images (optionnel)
echo "Pulling latest images..." | tee -a ~/sipzy/logs/maintenance.log
cd ~/sipzy
docker compose -f docker-compose.prod.yml pull

# 4. Logs rotation
echo "Rotating logs..." | tee -a ~/sipzy/logs/maintenance.log
find ~/sipzy/logs -name "*.log" -mtime +30 -delete

# 5. Disk space check
echo "Disk space:" | tee -a ~/sipzy/logs/maintenance.log
df -h / | tee -a ~/sipzy/logs/maintenance.log

echo "=== Maintenance complete ===" | tee -a ~/sipzy/logs/maintenance.log
```

### Mise à jour système

```bash
# Tous les mois
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

# Redémarrer si nécessaire (vérifier /var/run/reboot-required)
if [ -f /var/run/reboot-required ]; then
  echo "Reboot required"
  # Planifier un redémarrage
  sudo shutdown -r +10 "System reboot in 10 minutes for updates"
fi
```

### Rotation des logs

```bash
# Configurer logrotate
sudo nano /etc/logrotate.d/sipzy

/home/deploy/sipzy/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 deploy deploy
}
```

---

## Annexes

### Commandes utiles

```bash
# Quick commands
alias dc='docker compose -f ~/sipzy/docker-compose.prod.yml'
alias dcl='docker compose -f ~/sipzy/docker-compose.prod.yml logs -f'
alias dcp='docker compose -f ~/sipzy/docker-compose.prod.yml ps'
alias dcr='docker compose -f ~/sipzy/docker-compose.prod.yml restart'

# Health check rapide
alias sipzy-health='/home/deploy/sipzy/scripts/health-check.sh'

# Backup rapide
alias sipzy-backup='/home/deploy/sipzy/scripts/backup-db.sh'
```

### Contacts d'urgence

```
Équipe DevOps:
├── Lead DevOps: name@example.com / +33 X XX XX XX XX
├── SysAdmin: name@example.com / +33 X XX XX XX XX
└── Backup: name@example.com / +33 X XX XX XX XX

Support externe:
├── Hébergeur VPS: support@provider.com
├── DNS Provider: support@dns.com
└── Monitoring: alerts@monitoring.com

Documentation:
├── Wiki interne: https://wiki.sipzy.com
├── Status page: https://status.sipzy.com
└── Runbooks: https://docs.sipzy.com/runbooks
```

### Checklist go-live production

```
□ Infrastructure
  □ VPS configuré et sécurisé
  □ Firewall (UFW) activé
  □ Fail2ban configuré
  □ Docker installé
  □ Docker Compose installé

□ DNS
  □ Domaine pointé vers VPS
  □ Sous-domaines configurés (www, api, admin)
  □ Propagation DNS validée

□ SSL/TLS
  □ Certificats Let's Encrypt obtenus
  □ Renouvellement automatique configuré
  □ HTTPS fonctionnel
  □ Redirection HTTP → HTTPS active

□ Application
  □ Variables d'environnement configurées
  □ Secrets forts générés
  □ Services démarrés et healthy
  □ Health checks passants
  □ Logs accessibles

□ Base de données
  □ PostgreSQL configuré
  □ Backups automatiques configurés
  □ Test de restauration effectué
  □ Pas d'exposition publique du port 5432

□ Sécurité
  □ .env non commité dans Git
  □ Utilisateurs non-root dans containers
  □ Rate limiting activé (Nginx)
  □ Security headers configurés
  □ Scan de vulnérabilités passé

□ Monitoring
  □ Health checks automatiques
  □ Alertes configurées
  □ Logs centralisés (optionnel)
  □ Métriques Prometheus (optionnel)

□ CI/CD
  □ GitHub Actions configuré
  □ Secrets GitHub ajoutés
  □ Pipeline testé
  □ Déploiement automatique validé

□ Documentation
  □ README à jour
  □ Runbooks créés
  □ Contacts d'urgence documentés
  □ Procédure de rollback testée

□ Tests
  □ Tests fonctionnels passés
  □ Tests de charge effectués (optionnel)
  □ Smoke tests en production
  □ Monitoring de la production activé

□ Communication
  □ Équipe prévenue
  □ Status page créée (optionnel)
  □ Support prêt
```

---

**Document créé le:** 2025-11-09
**Version:** 1.0
**Contact:** DevOps Team
