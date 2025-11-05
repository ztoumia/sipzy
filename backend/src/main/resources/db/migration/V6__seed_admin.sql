-- V6: Seed Admin User and Demo User

-- Admin user: admin@sipzy.coffee / admin123
-- Password hash for "admin123" using BCrypt with strength 12
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('admin', 'admin@sipzy.coffee', '$2a$12$3YCkcIwG7iGUgCMKV488xuvU.duZAFaMMbtYVgUDyRKFt600pxbwW', 'ADMIN', TRUE, 'Sipzy Coffee Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Demo user: demo@sipzy.coffee / admin123
-- Password hash for "admin123" using BCrypt with strength 12
INSERT INTO users (username, email, password_hash, role, is_verified, bio, created_at, updated_at) VALUES
    ('demo_user', 'demo@sipzy.coffee', '$2a$12$3YCkcIwG7iGUgCMKV488xuvU.duZAFaMMbtYVgUDyRKFt600pxbwW', 'USER', TRUE, 'Demo user for testing Sipzy Coffee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
