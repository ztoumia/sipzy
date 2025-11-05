# Utilisateur Admin - Informations de Connexion

## Utilisateur Admin par défaut

Un utilisateur admin est automatiquement créé lors de l'exécution de la migration Flyway `V6__seed_admin.sql`.

### Identifiants Admin

```
Email:    admin@sipzy.coffee
Password: Admin123!
```

**⚠️ Important :** Le mot de passe contient :
- Une majuscule : `A`
- Des chiffres : `123`
- Un caractère spécial : `!`

### Utilisateur Demo

Un utilisateur de test est également créé :

```
Email:    demo@sipzy.coffee
Password: Demo123!
```

## Migration SQL

Le fichier de migration se trouve dans :
```
backend/src/main/resources/db/migration/V6__seed_admin.sql
```

Cette migration s'exécute automatiquement au démarrage de l'application si la base de données est vide.

## Vérification

### 1. Vérifier que l'utilisateur existe

Connectez-vous à PostgreSQL :

```bash
psql -U postgres -d sipzy
```

Puis exécutez :

```sql
SELECT id, username, email, role, is_verified
FROM users
WHERE email = 'admin@sipzy.coffee';
```

Vous devriez voir :

```
 id | username |       email        | role  | is_verified
----+----------+--------------------+-------+-------------
  1 | admin    | admin@sipzy.coffee | ADMIN | t
```

### 2. Tester la connexion

1. Ouvrez votre navigateur : `http://localhost:3000/auth/login`
2. Utilisez les identifiants :
   - Email : `admin@sipzy.coffee`
   - Password : `Admin123!`
3. Cliquez sur "Se connecter"

Ou utilisez le bouton de connexion rapide "Admin Sipzy" qui remplit automatiquement les champs.

### 3. Tester via Swagger UI

1. Ouvrez : `http://localhost:8080/swagger-ui.html`
2. Cherchez `POST /api/auth/login`
3. Cliquez sur "Try it out"
4. Utilisez ce JSON :

```json
{
  "email": "admin@sipzy.coffee",
  "password": "Admin123!"
}
```

5. Cliquez sur "Execute"
6. Vous devriez recevoir un token JWT

## Réinitialiser le mot de passe admin

Si vous avez oublié le mot de passe ou voulez le changer :

### Option 1 : Via SQL (recommandé pour reset)

```sql
-- Se connecter à PostgreSQL
psql -U postgres -d sipzy

-- Mettre à jour avec un nouveau hash (exemple: "NewPassword123!")
UPDATE users
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
```

### Option 2 : Générer un nouveau hash BCrypt

En Java, utilisez BCryptPasswordEncoder :

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String password = "YourNewPassword123!";
        String hash = encoder.encode(password);
        System.out.println("Hash: " + hash);
    }
}
```

### Option 3 : Recréer l'utilisateur

```sql
-- Supprimer l'ancien utilisateur
DELETE FROM users WHERE email = 'admin@sipzy.coffee';

-- Réexécuter la migration (ou copier-coller depuis V6__seed_admin.sql)
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Sécurité en Production

**⚠️ IMPORTANT :** En production, vous DEVEZ :

1. Changer le mot de passe par défaut immédiatement
2. Utiliser un mot de passe fort et unique
3. Activer l'authentification à deux facteurs si disponible
4. Ne jamais commiter les mots de passe dans Git
5. Utiliser des variables d'environnement pour les secrets

### Désactiver le compte admin de test

Si vous voulez désactiver le compte admin de test en production, modifiez `V6__seed_admin.sql` :

```sql
-- Remplacer la première ligne par :
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Devient :
-- INSERT INTO users ... (commenté pour ne pas créer le compte par défaut)
```

Ou ajoutez une condition sur l'environnement dans votre code Spring Boot.

## Permissions Admin

L'utilisateur avec le rôle `ADMIN` a accès à :

- `/admin/*` - Dashboard admin
- `/api/admin/*` - Endpoints d'administration
- Modération des cafés (approuver/rejeter)
- Gestion des utilisateurs (bannir/débannir)
- Gestion des signalements
- Accès à toutes les statistiques

## Troubleshooting

### Erreur : "Invalid email or password"

1. Vérifiez que vous utilisez **exactement** : `Admin123!` (avec majuscule et `!`)
2. Vérifiez que l'utilisateur existe dans la base de données
3. Vérifiez que `is_verified` est `TRUE`
4. Vérifiez que le backend est bien démarré sur le port 8080

### L'utilisateur admin n'existe pas

```sql
-- Vérifier si la migration a été exécutée
SELECT * FROM flyway_schema_history WHERE script = 'V6__seed_admin.sql';

-- Si elle n'a pas été exécutée, exécutez manuellement :
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
```

### Mot de passe oublié

Suivez les instructions dans "Réinitialiser le mot de passe admin" ci-dessus.
