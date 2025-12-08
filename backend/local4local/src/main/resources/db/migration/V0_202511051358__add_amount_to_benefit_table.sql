-- Add amount column to benefit table
ALTER TABLE l4l_global.benefit
ADD COLUMN amount numeric(10, 2);

-- Update existing records to set amount to 0.00
UPDATE l4l_global.benefit
SET amount = 0.00
WHERE amount IS NULL;

-- Ensure amount column is not null
ALTER TABLE l4l_global.benefit
ALTER COLUMN amount SET NOT NULL;