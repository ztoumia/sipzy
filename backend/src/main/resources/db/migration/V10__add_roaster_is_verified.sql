-- Add is_verified column to roasters table
-- All existing roasters are verified by default

ALTER TABLE roasters
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT true;

-- Add index for filtering by verification status
CREATE INDEX idx_roasters_is_verified ON roasters(is_verified);

-- Set all existing roasters as verified
UPDATE roasters SET is_verified = true WHERE is_verified IS NULL;
