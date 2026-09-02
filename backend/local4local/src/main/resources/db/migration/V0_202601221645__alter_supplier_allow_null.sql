-- Step 1: Add 'version' column to 'offers' table in 'l4l_global' schema
ALTER TABLE l4l_global.offers
ADD COLUMN version BIGINT;

-- Step 2: Update 'version' column to 0 for all existing records
UPDATE l4l_global.offers
SET version = 0
WHERE version IS NULL;

-- Step 3: Set 'version' column to NOT NULL
ALTER TABLE l4l_global.offers
ALTER COLUMN version SET NOT NULL;