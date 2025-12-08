-- Add a new column 'wage' to the 'tenants' table
ALTER TABLE l4l_security.tenants
ADD COLUMN wage NUMERIC(10, 2);

-- Populate the new 'wage' column with a default value of 2245.80 for all existing records
UPDATE l4l_security.tenants
SET wage = 2245.80;

-- Ensure that the 'wage' column is not null for future records
ALTER TABLE l4l_security.tenants
ALTER COLUMN wage SET NOT NULL;