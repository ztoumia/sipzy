-- V3: Add Triggers for Automatic Updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on all tables
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_roasters_updated_at BEFORE UPDATE ON roasters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_coffees_updated_at BEFORE UPDATE ON coffees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update coffee average rating and review count
CREATE OR REPLACE FUNCTION update_coffee_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coffees
    SET
        avg_rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE coffee_id = COALESCE(NEW.coffee_id, OLD.coffee_id)), 0.0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE coffee_id = COALESCE(NEW.coffee_id, OLD.coffee_id))
    WHERE id = COALESCE(NEW.coffee_id, OLD.coffee_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update coffee ratings when reviews change
CREATE TRIGGER trg_review_after_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_coffee_rating();

CREATE TRIGGER trg_review_after_update
    AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_coffee_rating();

CREATE TRIGGER trg_review_after_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_coffee_rating();

-- Function to update review helpful/not helpful counts
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
        ELSE
            UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_helpful != NEW.is_helpful THEN
            IF NEW.is_helpful THEN
                UPDATE reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = NEW.review_id;
            ELSE
                UPDATE reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
        ELSE
            UPDATE reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update review vote counts
CREATE TRIGGER trg_review_vote_after_insert
    AFTER INSERT ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();

CREATE TRIGGER trg_review_vote_after_update
    AFTER UPDATE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();

CREATE TRIGGER trg_review_vote_after_delete
    AFTER DELETE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();
