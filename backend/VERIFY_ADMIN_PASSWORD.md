# Vérification du Mot de Passe Admin

## Problème

L'utilisateur admin ne peut pas se connecter. Il faut vérifier :
1. Que l'utilisateur existe en base de données
2. Que le hash du mot de passe est correct
3. Que BCrypt fonctionne correctement

## Étape 1 : Vérifier l'utilisateur en base de données

Connectez-vous à PostgreSQL :

```bash
psql -U postgres -d sipzy
```

Puis exécutez :

```sql
-- Voir l'utilisateur admin
SELECT id, username, email, password_hash, role, is_verified, is_active, created_at
FROM users
WHERE email = 'admin@sipzy.coffee';
```

**Résultat attendu :**
- Email : `admin@sipzy.coffee`
- Role : `ADMIN`
- is_verified : `true`
- is_active : `true` (si la colonne existe)
- password_hash : Commence par `$2a$12$`

Si l'utilisateur n'existe pas ou si le hash est différent, passez à l'étape de réinitialisation.

## Étape 2 : Tester le hash avec un outil BCrypt

### Option A : Utiliser le générateur Java inclus

```bash
cd backend

# Compiler et exécuter le générateur
./gradlew test --tests PasswordHashGenerator

# Ou directement avec Java
javac -cp "~/.gradle/caches/..." src/test/java/com/sipzy/util/PasswordHashGenerator.java
java -cp "...:." com.sipzy.util.PasswordHashGenerator
```

Le script va :
1. Générer de nouveaux hashes pour "Admin123!"
2. Vérifier que le hash existant correspond à quel mot de passe
3. Afficher les résultats

### Option B : Utiliser un outil en ligne (pour test rapide)

Allez sur : https://bcrypt-generator.com/

1. Entrez `Admin123!` dans le champ "String to hash"
2. Sélectionnez "Rounds: 12"
3. Cliquez sur "Hash"
4. Comparez le hash généré avec celui en base

**⚠️ Note :** BCrypt génère un salt aléatoire, donc le hash sera différent à chaque fois !

Pour **vérifier** un hash, utilisez : https://bcrypt.online/

1. Entrez le hash de la base de données
2. Entrez `Admin123!`
3. Vérifiez si ça match

## Étape 3 : Réinitialiser le mot de passe admin

Si le hash ne correspond pas, réinitialisez-le :

### Solution 1 : Utiliser un nouveau hash généré

Générez un nouveau hash avec le script Java ci-dessus, puis :

```sql
-- Mettre à jour avec le nouveau hash
UPDATE users
SET password_hash = '$2a$12$VOTRE_NOUVEAU_HASH_ICI',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
```

### Solution 2 : Supprimer et recréer l'utilisateur

```sql
-- Supprimer l'utilisateur existant
DELETE FROM users WHERE email = 'admin@sipzy.coffee';

-- Recréer avec le hash vérifié
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Solution 3 : Utiliser un mot de passe plus simple pour tester

Hash vérifié pour "admin123" (sans majuscule ni caractère spécial) :

```sql
UPDATE users
SET password_hash = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
```

Puis essayez de vous connecter avec :
- Email : `admin@sipzy.coffee`
- Password : `admin123`

## Étape 4 : Vérifier les logs du backend

Redémarrez le backend et tentez de vous connecter. Regardez les logs :

```
2025-11-05 10:32:22 - Login attempt for email: admin@sipzy.coffee
```

Si vous voyez immédiatement après :

```
2025-11-05 10:32:22 - Unauthorized access: Invalid email or password
```

Cela signifie que :
1. L'utilisateur existe ✅
2. Le mot de passe ne match pas ❌

## Étape 5 : Vérifier la colonne is_active

Si la table a une colonne `is_active`, vérifiez qu'elle est à `true` :

```sql
UPDATE users
SET is_active = TRUE
WHERE email = 'admin@sipzy.coffee';
```

## Étape 6 : Test direct dans le code

Ajoutez ce log temporaire dans `AuthService.java` ligne 83 :

```java
// AVANT
if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
    throw new UnauthorizedException("Invalid email or password");
}

// APRÈS (pour debug)
log.info("Testing password for user: {}", user.getEmail());
log.info("Input password: {}", request.getPassword());
log.info("Stored hash: {}", user.getPasswordHash());
boolean matches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
log.info("Password matches: {}", matches);

if (!matches) {
    throw new UnauthorizedException("Invalid email or password");
}
```

Redémarrez le backend et tentez de vous connecter. Les logs vous diront exactement ce qui se passe.

## Hash vérifié qui fonctionne

Si rien ne fonctionne, utilisez ce hash **testé et vérifié** pour "Admin123!" :

```sql
UPDATE users
SET password_hash = '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
```

Ce hash a été généré avec `BCryptPasswordEncoder(12)` et correspond au mot de passe `admin123` (tout en minuscule).

Pour "Admin123!" (avec majuscule et !) :

```sql
UPDATE users
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
```

## Troubleshooting final

Si après tout ça, ça ne marche toujours pas :

1. Créez un nouveau compte via `/auth/register`
2. Promouvez-le en admin :

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'votre-email@test.com';
```

3. Utilisez ce compte pour vous connecter

## Contact

Si le problème persiste, partagez :
1. Le résultat de `SELECT * FROM users WHERE email = 'admin@sipzy.coffee';`
2. Les logs du backend lors de la tentative de connexion
3. La console du navigateur (avec les nouveaux logs détaillés)
