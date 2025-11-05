# Configuration API - Guide de démarrage

## Problème actuel

Si vous voyez l'erreur `[API Error] {}` lors de la connexion, cela signifie que **le backend Spring Boot n'est pas démarré** ou n'est pas accessible.

## Solution : Démarrer le backend

### 1. Configurer la base de données

Assurez-vous que PostgreSQL est installé et démarré, puis créez la base de données :

```bash
# Créer la base de données
createdb sipzy

# Ou via psql
psql -U postgres
CREATE DATABASE sipzy;
\q
```

### 2. Configurer le backend

Créez ou vérifiez le fichier `backend/.env` :

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sipzy
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
```

### 3. Démarrer le backend

```bash
cd backend
chmod +x gradlew
./gradlew bootRun
```

Le backend démarrera sur `http://localhost:8080`

### 4. Vérifier que le backend fonctionne

Ouvrez votre navigateur et allez sur :
- `http://localhost:8080/swagger-ui.html` - Documentation API
- `http://localhost:8080/api/coffees` - Test endpoint

### 5. Démarrer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarrera sur `http://localhost:3000`

## Configuration de l'URL de l'API

Le fichier `frontend/.env.local` contient :

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Si votre backend est sur un autre port ou domaine, modifiez cette valeur.

## Erreurs courantes

### 1. `[API Error] { message: "Network Error" }`

**Cause :** Le backend n'est pas démarré ou n'est pas accessible.

**Solution :**
- Vérifiez que le backend est bien démarré (`./gradlew bootRun`)
- Vérifiez l'URL dans `.env.local`
- Vérifiez que le port 8080 est libre

### 2. `[API Error] { status: 401 }`

**Cause :** Token JWT invalide ou expiré.

**Solution :**
- Déconnectez-vous et reconnectez-vous
- Videz le localStorage du navigateur

### 3. `[API Error] { status: 404 }`

**Cause :** L'endpoint n'existe pas sur le backend.

**Solution :**
- Vérifiez que vous utilisez la bonne version du backend
- Consultez la documentation Swagger : `http://localhost:8080/swagger-ui.html`

### 4. CORS Error

**Cause :** Le backend n'autorise pas les requêtes depuis le frontend.

**Solution :**
- Vérifiez la configuration CORS dans `backend/src/main/java/com/sipzy/config/SecurityConfig.java`
- Le frontend doit être autorisé : `http://localhost:3000`

## Mode développement sans backend

Si vous voulez développer l'interface sans le backend, vous pouvez temporairement utiliser mockApi :

```typescript
// Dans vos pages, changez temporairement :
import api from '@/lib/api/mockApi'; // Au lieu de realApi
```

**Note :** Ceci est déconseillé car la migration vers realApi est déjà complète.

## Tests end-to-end

Une fois le backend et le frontend démarrés :

1. ✅ **Créer un compte** : `http://localhost:3000/auth/register`
2. ✅ **Se connecter** : `http://localhost:3000/auth/login`
3. ✅ **Consulter les cafés** : `http://localhost:3000/coffees`
4. ✅ **Créer un café** : `http://localhost:3000/coffees/new`
5. ✅ **Ajouter un avis** : Cliquez sur un café puis "Ajouter un avis"

## Endpoints backend disponibles

Consultez la documentation complète : `http://localhost:8080/swagger-ui.html`

Principaux endpoints :
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/coffees` - Liste des cafés
- `GET /api/coffees/{id}` - Détail d'un café
- `POST /api/coffees` - Créer un café
- `GET /api/reviews` - Liste des avis
- `POST /api/reviews` - Créer un avis
- `GET /api/roasters` - Liste des torréfacteurs
- `GET /api/notes` - Liste des notes aromatiques

## Support

Si vous rencontrez toujours des problèmes, vérifiez les logs :
- **Backend :** Logs dans le terminal où vous avez lancé `./gradlew bootRun`
- **Frontend :** Console du navigateur (F12) et terminal où vous avez lancé `npm run dev`
