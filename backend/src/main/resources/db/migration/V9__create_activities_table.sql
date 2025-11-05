-- Create activities table for admin activity log
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    coffee_id BIGINT REFERENCES coffees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_coffee_id ON activities(coffee_id);

-- Add comment
COMMENT ON TABLE activities IS 'Admin activity log for tracking system events';
