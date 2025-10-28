-- V8: Add is_active column to users table for ban/unban functionality

ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Create index for filtering active users
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON COLUMN users.is_active IS 'User account status - false means banned';
