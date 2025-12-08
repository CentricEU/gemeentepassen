-- Step 1: Add Email and Phone Number columns to the tenant table (as nullable first)
ALTER TABLE l4l_security.tenants
ADD COLUMN email VARCHAR(256),
ADD COLUMN phone VARCHAR(32);

-- Step 2: Set placeholder Email and Phone Number for all tenants
UPDATE l4l_security.tenants
SET email = 'example@municipality.nl',
    phone = '+31 6 22459638';

-- Step 3: Set Email and Phone Number as NOT NULL after data is populated
ALTER TABLE l4l_security.tenants
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN phone SET NOT NULL;