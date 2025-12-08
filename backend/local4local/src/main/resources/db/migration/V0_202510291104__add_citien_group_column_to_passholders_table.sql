BEGIN;

-- ===========================================================
-- STEP 1: Add citizen_group_id column and foreign key
-- ===========================================================

ALTER TABLE l4l_global.passholders
ADD COLUMN IF NOT EXISTS citizen_group_id uuid;

-- Drop existing FK if it was created incorrectly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_citizen_group_id'
          AND table_schema = 'l4l_global'
          AND table_name = 'passholders'
    ) THEN
        ALTER TABLE l4l_global.passholders
        DROP CONSTRAINT fk_citizen_group_id;
    END IF;
END $$;

-- Create the correct foreign key
ALTER TABLE l4l_global.passholders
ADD CONSTRAINT fk_citizen_group_id
FOREIGN KEY (citizen_group_id)
REFERENCES l4l_global.citizen_group(id)
ON DELETE CASCADE;

-- ===========================================================
-- STEP 2: Create a "Default" citizen group for each tenant
-- ===========================================================

INSERT INTO l4l_global.citizen_group (
    id,
    group_name,
    age_group,
    includes_dependent_children,
    threshold_amount,
    max_income,
    eligibility_criteria,
    required_documents,
    created_date,
    tenant_id
)
SELECT
    gen_random_uuid() AS id,
    'Default' AS group_name,
    ARRAY['AGE_18_64'::l4l_global.age_group] AS age_group,
    FALSE AS includes_dependent_children,
    44 AS threshold_amount,
    988.15 AS max_income,
    ARRAY['HAS_EXISTING_DIGID'::l4l_global.eligibility_criteria] AS eligibility_criteria,
    ARRAY['PROOF_OF_IDENTITY'::l4l_global.required_documents] AS required_documents,
    NOW() AS created_date,
    t.id AS tenant_id
FROM l4l_security.tenants t
WHERE NOT EXISTS (
    SELECT 1
    FROM l4l_global.citizen_group cg
    WHERE cg.tenant_id = t.id
      AND cg.group_name = 'Default'
);

-- ===========================================================
-- STEP 3: Assign each passholder to its tenant's Default group
-- ===========================================================

UPDATE l4l_global.passholders p
SET citizen_group_id = cg.id
FROM l4l_global.citizen_group cg
WHERE cg.tenant_id = p.tenant_id
  AND cg.group_name = 'Default';

-- ===========================================================
-- STEP 4: Make citizen_group_id NOT NULL (after validation)
-- ===========================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM l4l_global.passholders WHERE citizen_group_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Some passholders still have NULL citizen_group_id';
    END IF;
END $$;

-- Enforce NOT NULL constraint
ALTER TABLE l4l_global.passholders
ALTER COLUMN citizen_group_id SET NOT NULL;

COMMIT;
