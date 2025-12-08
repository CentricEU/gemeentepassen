-- Step 1: Create benefit_status enum type
CREATE TYPE l4l_global.benefit_status AS ENUM (
    'ACTIVE',
    'EXPIRED'
);
-- Step 2: Add status column to benefits table
ALTER TABLE l4l_global.benefit
ADD COLUMN status l4l_global.benefit_status DEFAULT 'ACTIVE';

-- Step 3: Before scheduler runs, set status to EXPIRED for already expired benefits
UPDATE l4l_global.benefit
SET status = 'EXPIRED'
WHERE expiration_date < current_date;

-- Step 4: Create procedure to update benefit status based on expiration date
CREATE OR REPLACE PROCEDURE l4l_global.update_benefit_status()
LANGUAGE plpgsql
AS $$
BEGIN 
	UPDATE l4l_global.benefits
	SET status= 'EXPIRED'
	WHERE expiration_date < current_date;
END
$$;
