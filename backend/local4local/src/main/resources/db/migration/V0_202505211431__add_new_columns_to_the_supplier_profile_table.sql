-- Step 1: Add new columns to the supplier_profile table
ALTER TABLE l4l_security.supplier_profile
ADD COLUMN iban VARCHAR(18),
ADD COLUMN bic VARCHAR(11) NULL;

-- Step 2: Set a placeholder IBAN for all existing rows (only those with NULL iban)
UPDATE l4l_security.supplier_profile
SET iban = 'NL00TEST0417164300'
WHERE iban IS NULL;

-- Step 3: Set the iban column to NOT NULL
ALTER TABLE l4l_security.supplier_profile
ALTER COLUMN iban SET NOT NULL;

-- Step 4: Add constraint for Dutch IBAN (exactly 18 characters, starts with 'NL', followed by 2 digits and 14 alphanumeric chars)
ALTER TABLE l4l_security.supplier_profile
ADD CONSTRAINT chk_supplier_profile_iban_nl
CHECK (
  iban ~ '^NL[0-9]{2}[A-Z]{4}[0-9]{10}$'
);

-- Step 5: Add constraint for BIC (optional, but if provided must be 8 or 11 uppercase alphanumeric characters)
ALTER TABLE l4l_security.supplier_profile
ADD CONSTRAINT chk_supplier_profile_bic_format
CHECK (
  bic IS NULL OR bic ~ '^[A-Z0-9]{8}([A-Z0-9]{3})?$'
);