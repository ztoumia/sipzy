-- V7: Enable Full-Text Search using pg_trgm

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN indexes for trigram search on coffees
CREATE INDEX idx_coffees_name_trgm ON coffees USING gin(name gin_trgm_ops);
CREATE INDEX idx_coffees_description_trgm ON coffees USING gin(description gin_trgm_ops);

-- Add GIN index for roasters
CREATE INDEX idx_roasters_name_trgm ON roasters USING gin(name gin_trgm_ops);

-- Optional: Add tsvector column for full-text search (alternative to pg_trgm)
-- ALTER TABLE coffees ADD COLUMN search_vector tsvector;
-- CREATE INDEX idx_coffees_search_vector ON coffees USING gin(search_vector);
--
-- CREATE OR REPLACE FUNCTION coffees_search_vector_update() RETURNS trigger AS $$
-- BEGIN
--     NEW.search_vector :=
--         setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
--         setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
--         setweight(to_tsvector('english', coalesce(NEW.origin, '')), 'C');
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trg_coffees_search_vector_update BEFORE INSERT OR UPDATE ON coffees
--     FOR EACH ROW EXECUTE FUNCTION coffees_search_vector_update();
