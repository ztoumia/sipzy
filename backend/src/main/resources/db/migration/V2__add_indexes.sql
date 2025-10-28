-- V2: Add Performance Indexes

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- Roasters indexes
CREATE INDEX idx_roasters_name ON roasters(name);

-- Coffees indexes
CREATE INDEX idx_coffees_status ON coffees(status);
CREATE INDEX idx_coffees_origin ON coffees(origin);
CREATE INDEX idx_coffees_roaster_id ON coffees(roaster_id);
CREATE INDEX idx_coffees_avg_rating ON coffees(avg_rating DESC);
CREATE INDEX idx_coffees_created_at ON coffees(created_at DESC);
CREATE INDEX idx_coffees_submitted_by ON coffees(submitted_by);

-- Reviews indexes
CREATE INDEX idx_reviews_coffee_id ON reviews(coffee_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC);

-- Coffee_notes indexes
CREATE INDEX idx_coffee_notes_note_id ON coffee_notes(note_id);

-- Review_votes indexes
CREATE INDEX idx_review_votes_review_id ON reviews(id);

-- Reports indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_entity ON reports(entity_type, entity_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
