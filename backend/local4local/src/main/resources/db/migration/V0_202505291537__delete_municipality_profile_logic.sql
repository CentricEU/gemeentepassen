-- Step 1: Drop the municipality_profile table if it exists
DROP TABLE IF EXISTS l4l_security.municipality_profile;

-- Step 2: Add IBAN and BIC columns to the tenant table (as nullable first)
ALTER TABLE l4l_security.tenants
ADD COLUMN iban VARCHAR(18),
ADD COLUMN bic VARCHAR(11);

-- Step 3: Set placeholder IBAN and BIC for all tenants
UPDATE l4l_security.tenants
SET iban = 'NL91ABNA0417164300',
    bic = 'ABNANL2A';

-- Step 4: Set iban as NOT NULL after data is populated
ALTER TABLE l4l_security.tenants
ALTER COLUMN iban SET NOT NULL;

-- Step 5: Revert is_approved to false for users with role_id = 0 (who were previously approved)
UPDATE l4l_security.user
SET is_approved = false
WHERE id IN (
    SELECT user_id
    FROM l4l_security.user_role
    WHERE role_id = 0 AND is_approved = true
);
