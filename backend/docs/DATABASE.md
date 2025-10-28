# Database Schema

## Tables

### users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    avatar_url VARCHAR(500),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### roasters
```sql
CREATE TABLE roasters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### coffees
```sql
CREATE TABLE coffees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roaster_id BIGINT REFERENCES roasters(id),
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
    status VARCHAR(20) DEFAULT 'PENDING',
    submitted_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### reviews
```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    coffee_id BIGINT NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    image_url VARCHAR(500),
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (coffee_id, user_id)
);
```

### notes (Tasting Notes)
```sql
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO notes (name, category) VALUES
    ('Chocolate', 'Chocolatey'),
    ('Caramel', 'Sweet'),
    ('Citrus', 'Fruity'),
    ('Berry', 'Fruity'),
    ('Floral', 'Floral'),
    ('Nutty', 'Nutty');
```

### coffee_notes (Many-to-Many)
```sql
CREATE TABLE coffee_notes (
    coffee_id BIGINT REFERENCES coffees(id) ON DELETE CASCADE,
    note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE,
    PRIMARY KEY (coffee_id, note_id)
);
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Coffees
CREATE INDEX idx_coffees_status ON coffees(status);
CREATE INDEX idx_coffees_origin ON coffees(origin);
CREATE INDEX idx_coffees_avg_rating ON coffees(avg_rating DESC);

-- Reviews
CREATE INDEX idx_reviews_coffee_id ON reviews(coffee_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

## Triggers

### Update coffee ratings
```sql
CREATE OR REPLACE FUNCTION update_coffee_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coffees
    SET
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE coffee_id = NEW.coffee_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE coffee_id = NEW.coffee_id)
    WHERE id = NEW.coffee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_after_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_coffee_rating();
```

## Migrations

Flyway migrations in `src/main/resources/db/migration/`:

- `V1__init_schema.sql` - Create tables
- `V2__add_indexes.sql` - Add performance indexes
- `V3__add_triggers.sql` - Add triggers for ratings
- `V4__seed_notes.sql` - Seed tasting notes (30 notes)
- `V5__seed_roasters.sql` - Seed demo roasters
- `V6__seed_admin.sql` - Create admin user

## Entity Relationships

```
users (1) ─────┬──────> (N) reviews
               │
coffees (1) ───┴──────> (N) reviews
coffees (N) ───────────> (N) notes (via coffee_notes)
coffees (N) ───────────> (1) roasters
```
