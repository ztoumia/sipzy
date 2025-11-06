# Sipzy Coffee - Backoffice Admin

Interface d'administration pour la plateforme Sipzy Coffee.

## Description

Le backoffice admin est une application Next.js séparée dédiée à la gestion administrative de la plateforme Sipzy. Il permet aux administrateurs de :

- Modérer les cafés soumis (approuver/rejeter)
- Gérer les utilisateurs (bannir/débannir)
- Traiter les rapports et signalements
- Visualiser les statistiques du site
- Importer des données en masse
- Consulter les logs d'activité

## Accès

- **URL de développement**: http://localhost:3001
- **URL de production**: À configurer selon votre déploiement

## Prérequis

- Node.js 20+
- npm ou yarn
- Backend Sipzy en cours d'exécution sur le port 8080

## Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Éditer .env.local selon vos besoins
```

## Variables d'environnement

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8080

# Application
NEXT_PUBLIC_APP_NAME=Sipzy Admin
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # URL du site public

# Environnement
NODE_ENV=development

# Port serveur
PORT=3001
```

## Développement

```bash
# Lancer en mode développement
npm run dev

# Lancer avec Turbopack (plus rapide)
npm run dev:turbo
```

L'application sera accessible sur http://localhost:3001

## Build de production

```bash
# Créer un build de production
npm run build

# Lancer le build en production
npm start
```

## Docker

```bash
# Builder l'image Docker
docker build -t sipzy-backoffice .

# Lancer avec docker-compose (depuis la racine du projet)
cd ..
docker-compose up backoffice
```

## Authentification

### Connexion

Seuls les utilisateurs avec le rôle **ADMIN** peuvent accéder au backoffice.

1. Accédez à http://localhost:3001/login
2. Connectez-vous avec vos identifiants administrateur
3. Le système vérifie automatiquement votre rôle

### Sécurité

- **Middleware de protection**: Toutes les routes (sauf /login) nécessitent une authentification
- **Vérification du rôle**: Le backend valide le rôle ADMIN sur chaque requête API
- **Token JWT**: Authentification par token avec expiration automatique
- **Cookies sécurisés**: Les tokens sont stockés dans des cookies HTTP-only

## Structure du projet

```
backoffice/
├── app/
│   ├── (auth)/
│   │   └── login/          # Page de connexion admin
│   ├── (dashboard)/        # Routes protégées
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── coffees/        # Modération des cafés
│   │   ├── users/          # Gestion des utilisateurs
│   │   ├── reports/        # Traitement des rapports
│   │   ├── analytics/      # Statistiques
│   │   ├── activity/       # Logs d'activité
│   │   ├── import/         # Import de données
│   │   └── settings/       # Paramètres
│   ├── layout.tsx          # Layout racine
│   ├── providers.tsx       # Contextes React
│   └── globals.css         # Styles globaux
├── components/
│   ├── layout/             # Sidebar, TopBar, Navigation
│   ├── shared/             # Composants partagés (SearchBar, Pagination, etc.)
│   ├── import/             # Composants d'import de données
│   ├── features/           # Composants métier (Stats, ReviewQueue, etc.)
│   └── ui/                 # Composants UI de base
├── contexts/
│   ├── AuthContext.tsx     # Authentification avec vérification ADMIN
│   ├── ToastContext.tsx    # Notifications
│   └── AdminSidebarContext.tsx  # État de la sidebar
├── hooks/
│   ├── useAuth.ts
│   └── useToast.ts
├── lib/
│   ├── api/
│   │   ├── apiClient.ts    # Client HTTP Axios
│   │   ├── realApi.ts      # Endpoints API admin
│   │   └── importApi.ts    # API d'import de données
│   ├── types/
│   │   └── api.ts          # Types TypeScript
│   ├── utils/
│   └── validation/
├── middleware.ts           # Protection des routes + vérification rôle
├── package.json
├── tsconfig.json
├── next.config.ts
└── Dockerfile
```

## Fonctionnalités principales

### 1. Dashboard
- Vue d'ensemble des statistiques
- Nombres de cafés, utilisateurs, avis
- Liste des cafés en attente de modération
- Activité récente du site

### 2. Modération des cafés
- Consulter tous les cafés (pending, approved, rejected)
- Approuver ou rejeter des cafés
- Ajouter des notes administratives
- Recherche et filtres avancés

### 3. Gestion des utilisateurs
- Liste de tous les utilisateurs
- Bannir/débannir des utilisateurs
- Consulter les profils et l'activité
- Gérer les administrateurs

### 4. Gestion des rapports
- Consulter les signalements (pending, resolved, dismissed)
- Résoudre ou rejeter des rapports
- Historique des modérations

### 5. Analytiques
- Statistiques détaillées
- Graphiques d'évolution
- Métriques de performance

### 6. Import de données
- Import JSON de cafés et torréfacteurs
- Validation des données
- Suivi de progression
- Rapport détaillé des résultats

### 7. Logs d'activité
- Historique des actions administratives
- Traçabilité complète
- Filtres par type d'action

## API

Le backoffice utilise les endpoints suivants :

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/verify-token

Admin - Dashboard
  GET    /api/admin/stats
  GET    /api/admin/activity

Admin - Coffees
  GET    /api/admin/coffees
  GET    /api/admin/coffees/pending
  PUT    /api/admin/coffees/{id}/approve
  PUT    /api/admin/coffees/{id}/reject

Admin - Users
  GET    /api/admin/users
  PUT    /api/admin/users/{id}/ban
  PUT    /api/admin/users/{id}/unban

Admin - Reports
  GET    /api/admin/reports
  GET    /api/admin/reports/pending
  PUT    /api/admin/reports/{id}/resolve
  PUT    /api/admin/reports/{id}/dismiss

Import
  POST   /api/import/batch
  POST   /api/import/roasters
  POST   /api/import/coffees
```

## Développement

### Scripts disponibles

```bash
npm run dev          # Démarrer en développement (port 3001)
npm run build        # Créer un build de production
npm start            # Lancer le build de production
npm run lint         # Vérifier le code avec ESLint
```

### Technologies utilisées

- **Framework**: Next.js 15.5.6 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios 1.13.2
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Différences avec le frontend public

| Aspect | Frontend Public | Backoffice Admin |
|--------|----------------|------------------|
| Port | 3000 | 3001 |
| Routes | Site public + Auth | Dashboard admin uniquement |
| Authentification | Tous utilisateurs | Admin uniquement |
| API | Endpoints publics | Endpoints admin |
| Design | Grand public | Interface de gestion |
| Middleware | Protection basique | Vérification rôle ADMIN |

## Déploiement

### Docker

```bash
# Depuis la racine du projet
docker-compose up -d backoffice
```

### Variables d'environnement en production

```env
NEXT_PUBLIC_API_URL=https://api.sipzy.coffee
NEXT_PUBLIC_SITE_URL=https://sipzy.coffee
NODE_ENV=production
PORT=3001
```

### Reverse Proxy (Nginx)

Exemple de configuration pour servir le backoffice sur un sous-domaine :

```nginx
server {
    listen 80;
    server_name admin.sipzy.coffee;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Sécurité

### Checklist de sécurité

- [ ] Vérifier que seuls les ADMIN peuvent se connecter
- [ ] Configurer des tokens JWT avec expiration appropriée
- [ ] Utiliser HTTPS en production
- [ ] Configurer les CORS correctement côté backend
- [ ] Limiter les tentatives de connexion (rate limiting)
- [ ] Activer les logs de sécurité
- [ ] Utiliser des mots de passe forts pour les comptes admin
- [ ] Configurer les en-têtes de sécurité HTTP

### Rate Limiting

Le backoffice hérite du système de rate limiting du backend :
- Limite par défaut : 100 requêtes / minute
- Retry automatique sur 429 (taux dépassé)
- Headers de rate limit dans les réponses

## Résolution de problèmes

### Impossible de se connecter

1. Vérifier que le backend est bien démarré
2. Vérifier que l'utilisateur a le rôle ADMIN
3. Vérifier les logs du backend pour les erreurs d'authentification
4. Vérifier que CORS est configuré correctement

### Port 3001 déjà utilisé

```bash
# Trouver le processus utilisant le port
lsof -i :3001

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env.local
PORT=3002
```

### Erreurs de build

```bash
# Nettoyer le cache
rm -rf .next node_modules
npm install
npm run build
```

## Support

Pour toute question ou problème :
- Ouvrir une issue sur le repo GitHub
- Consulter la documentation backend
- Contacter l'équipe de développement

## Licence

© 2025 Sipzy Coffee. Tous droits réservés.
