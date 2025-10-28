-- V1: Initial Schema Creation
-- Tables: users, roasters, coffees, reviews, notes, coffee_notes, review_votes, reports

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Roasters table
CREATE TABLE roasters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(100),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Coffees table
CREATE TABLE coffees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roaster_id BIGINT REFERENCES roasters(id) ON DELETE SET NULL,
    origin VARCHAR(100),
    process VARCHAR(50),
    variety VARCHAR(100),
    altitude_min INTEGER,
    altitude_max INTEGER,
    harvest_year INTEGER,
    price_range VARCHAR(20),
    description TEXT,
    image_url VARCHAR(500),
    avg_rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    submitted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    moderated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    moderation_reason TEXT,
    moderated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    coffee_id BIGINT NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    brew_method VARCHAR(50),
    helpful_count INTEGER DEFAULT 0 NOT NULL,
    not_helpful_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uk_reviews_user_coffee UNIQUE (user_id, coffee_id)
);

-- Notes (tasting notes) table
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Coffee_notes junction table (many-to-many)
CREATE TABLE coffee_notes (
    coffee_id BIGINT NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    PRIMARY KEY (coffee_id, note_id)
);

-- Review_votes table
CREATE TABLE review_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uk_review_votes_user_review UNIQUE (user_id, review_id)
);

-- Reports table (for moderation)
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    resolved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
