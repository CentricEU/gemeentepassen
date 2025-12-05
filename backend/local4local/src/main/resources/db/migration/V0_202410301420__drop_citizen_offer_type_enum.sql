-- Alter the table to change the column type and default
ALTER TABLE l4l_global.offers
    ALTER COLUMN citizen_offer_type SET DEFAULT 'CITIZEN_WITH_PASS',  -- Set new default
    ALTER COLUMN citizen_offer_type TYPE VARCHAR(255) USING citizen_offer_type::text;  -- Change type to VARCHAR

-- Drop the enum type now that it's no longer used
DROP TYPE IF EXISTS l4l_global.citizen_offer_type;

-- Delete all rows in the l4l_global.offers table where citizen_offer_type has the value 'CITIZEN'
DELETE FROM l4l_global.offers
WHERE citizen_offer_type = 'CITIZEN';
