-- Step 1: Drop the columns that use the enums
ALTER TABLE l4l_global.benefit
    DROP COLUMN IF EXISTS benefit_type,
    DROP COLUMN IF EXISTS facility_types;

-- Step 2: Drop the enum types
DROP TYPE IF EXISTS l4l_global.benefit_type;
DROP TYPE IF EXISTS l4l_global.facility_type;
