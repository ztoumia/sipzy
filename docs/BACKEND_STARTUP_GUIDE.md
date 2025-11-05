# Guide de Démarrage Rapide - Backend Sipzy

## Problème : Connection refused sur port 8080

Si vous voyez `Connection refused` ou `[API Error] {}`, le backend n'est pas démarré correctement.

## Vérifications préalables

### 1. Vérifier si un processus écoute sur le port 8080

```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
# ou
netstat -tln | grep 8080
```

Si rien n'apparaît, le backend n'est pas démarré.

### 2. Vérifier la configuration de la base de données

Le backend nécessite PostgreSQL. Créez le fichier `backend/.env` :

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sipzy
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT Configuration
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Créer la base de données PostgreSQL

```bash
# Démarrer PostgreSQL (si pas déjà fait)
# Windows: Services -> PostgreSQL
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql

# Créer la base de données
psql -U postgres
CREATE DATABASE sipzy;
\q
```

## Démarrage du Backend

### Option 1 : Avec Gradle (Recommandé)

```bash
cd backend

# Donner les permissions d'exécution (Linux/Mac)
chmod +x gradlew

# Démarrer le backend
./gradlew bootRun

# Windows
gradlew.bat bootRun
```

Le backend devrait afficher :
```
Started SipzyApplication in X.XXX seconds
```

### Option 2 : Avec Docker

Si vous préférez utiliser Docker :

```bash
cd backend
docker build -t sipzy-backend .
docker run -p 8080:8080 --env-file .env sipzy-backend
```

### Option 3 : Build JAR puis exécuter

```bash
cd backend
./gradlew clean build
java -jar build/libs/sipzy-backend-0.0.1-SNAPSHOT.jar
```

## Vérification que le backend fonctionne

### Test 1 : Swagger UI

Ouvrez votre navigateur : `http://localhost:8080/swagger-ui.html`

Vous devriez voir la documentation interactive de l'API.

### Test 2 : Endpoint de test

```bash
curl http://localhost:8080/api/coffees
```

Devrait retourner une liste vide ou des cafés (format JSON).

### Test 3 : Health check

```bash
curl http://localhost:8080/actuator/health
```

Devrait retourner : `{"status":"UP"}`

## Erreurs courantes

### Erreur 1 : "Could not find or load main class"

**Cause :** Build incomplet ou classe principale non trouvée.

**Solution :**
```bash
./gradlew clean build
./gradlew bootRun
```

### Erreur 2 : "Port 8080 is already in use"

**Cause :** Un autre processus utilise le port 8080.

**Solution :**
```bash
# Trouver le processus
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

Ou changez le port dans `backend/.env` :
```env
SERVER_PORT=8081
```

Et mettez à jour `frontend/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Erreur 3 : "Connection refused" à PostgreSQL

**Cause :** PostgreSQL n'est pas démarré ou mal configuré.

**Solution :**
```bash
# Vérifier que PostgreSQL est démarré
# Windows
services.msc → PostgreSQL

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Mac
brew services list
brew services start postgresql
```

Vérifiez aussi les credentials dans `backend/.env`.

### Erreur 4 : "Table 'coffee' doesn't exist"

**Cause :** Les migrations Flyway n'ont pas été exécutées.

**Solution :** Flyway s'exécute automatiquement au démarrage. Vérifiez les logs :
```
Flyway: Migrating schema "public" to version 1 - init schema
```

Si les migrations ne s'exécutent pas :
1. Vérifiez que `src/main/resources/db/migration/` contient les fichiers SQL
2. Vérifiez les logs pour voir si Flyway a des erreurs

### Erreur 5 : CORS errors dans le navigateur

**Cause :** Le backend n'autorise pas les requêtes depuis `http://localhost:3000`.

**Solution :** Vérifiez `backend/src/main/java/com/sipzy/config/SecurityConfig.java` :

```java
.cors(cors -> cors
    .configurationSource(request -> {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        config.setAllowedMethods(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        return config;
    })
)
```

## Logs du backend

Les logs s'affichent dans le terminal où vous avez lancé `./gradlew bootRun`.

Cherchez :
- `✅ Started SipzyApplication` → Backend démarré avec succès
- `❌ Error starting ApplicationContext` → Erreur de démarrage
- `❌ HikariPool` errors → Problème de connexion à la base de données
- `❌ Port 8080 is already in use` → Port déjà utilisé

## Une fois le backend démarré

1. ✅ Redémarrez le frontend Next.js (Ctrl+C puis `npm run dev`)
2. ✅ Testez la connexion : `http://localhost:3000/auth/login`
3. ✅ Créez un compte : `http://localhost:3000/auth/register`
4. ✅ Explorez l'API : `http://localhost:8080/swagger-ui.html`

## URLs importantes

- **Frontend :** http://localhost:3000
- **Backend API :** http://localhost:8080
- **Swagger UI :** http://localhost:8080/swagger-ui.html
- **H2 Console (si activé) :** http://localhost:8080/h2-console

## Besoin d'aide ?

Si le problème persiste :
1. Partagez les logs du backend (dernières 50 lignes)
2. Vérifiez que PostgreSQL fonctionne
3. Vérifiez le fichier `backend/.env`
4. Vérifiez qu'aucun firewall ne bloque le port 8080
