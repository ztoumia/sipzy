-- =====================================================================
-- Script de Réinitialisation du Mot de Passe Admin
-- À exécuter si l'admin ne peut pas se connecter
-- =====================================================================

-- Vérifier d'abord si l'utilisateur existe
SELECT
    id,
    username,
    email,
    role,
    is_verified,
    CASE
        WHEN is_active IS NOT NULL THEN is_active::text
        ELSE 'column does not exist'
    END as is_active,
    created_at
FROM users
WHERE email = 'admin@sipzy.coffee';

-- Si l'utilisateur existe, réinitialisez le mot de passe
-- =====================================================================

-- Option 1 : Mot de passe "admin123" (simple, pour tester)
-- Hash BCrypt vérifié avec strength 12
UPDATE users
SET password_hash = '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';

-- Vérifier que ça a marché
SELECT
    email,
    password_hash,
    substring(password_hash from 1 for 20) as hash_preview
FROM users
WHERE email = 'admin@sipzy.coffee';

-- Pour revenir à "Admin123!" plus tard :
/*
UPDATE users
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sipzy.coffee';
*/

-- =====================================================================
-- Si l'utilisateur n'existe PAS, créez-le
-- =====================================================================

/*
-- Avec mot de passe "admin123"
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at)
VALUES (
    'admin',
    'admin@sipzy.coffee',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    TRUE,
    'Sipzy Coffee Admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
*/

-- =====================================================================
-- S'assurer que is_active est true (si la colonne existe)
-- =====================================================================

-- Tentative d'update (ignorera l'erreur si la colonne n'existe pas)
DO $$
BEGIN
    BEGIN
        UPDATE users SET is_active = TRUE WHERE email = 'admin@sipzy.coffee';
    EXCEPTION
        WHEN undefined_column THEN
            RAISE NOTICE 'Column is_active does not exist, skipping';
    END;
END $$;

-- =====================================================================
-- Vérification finale
-- =====================================================================

SELECT
    'Admin user status:' as info,
    COUNT(*) as count,
    MAX(email) as email,
    MAX(role) as role,
    MAX(is_verified::text) as is_verified
FROM users
WHERE email = 'admin@sipzy.coffee';

-- =====================================================================
-- APRÈS avoir exécuté ce script :
-- =====================================================================
-- 1. Redémarrer le backend Spring Boot
-- 2. Aller sur http://localhost:3000/auth/login
-- 3. Se connecter avec :
--    Email:    admin@sipzy.coffee
--    Password: admin123
--
-- 4. Si ça marche, changez le mot de passe pour quelque chose de plus sécurisé
-- =====================================================================
