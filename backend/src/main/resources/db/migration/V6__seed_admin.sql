-- V6: Seed Admin User and Demo User

-- Admin user: admin@sipzy.coffee / Admin123!
-- Password hash for "Admin123!" using BCrypt with strength 12
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lwih.1Y9vJSOhK7va', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Demo user: demo@sipzy.coffee / Demo123!
-- Password hash for "Demo123!" using BCrypt with strength 12
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('demo_user', 'demo@sipzy.coffee', '$2a$12$fZ8QhnQI/xCXP3VXWYRjOeCsF6YjPJVPYGy1KGpqQjZE7.fLLvpKG', 'USER', TRUE, 'Demo user for testing Sipzy Coffee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
