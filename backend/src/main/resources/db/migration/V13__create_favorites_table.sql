-- Create favorites table
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_coffee FOREIGN KEY (coffee_id) REFERENCES coffees(id) ON DELETE CASCADE,
    CONSTRAINT uq_favorites_user_coffee UNIQUE (user_id, coffee_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_coffee_id ON favorites(coffee_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Add comment
COMMENT ON TABLE favorites IS 'User favorite coffees';
COMMENT ON COLUMN favorites.user_id IS 'ID of the user who favorited';
COMMENT ON COLUMN favorites.coffee_id IS 'ID of the favorited coffee';
COMMENT ON COLUMN favorites.created_at IS 'Timestamp when the favorite was added';
