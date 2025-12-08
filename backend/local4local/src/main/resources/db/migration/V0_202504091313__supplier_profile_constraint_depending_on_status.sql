-- A constraint to ensure that when the status is 'APPROVED' or 'PENDING',
-- the supplier_profile (profile_id) cannot be NULL, but allows NULL if status is 'CREATED'.
ALTER TABLE l4l_security.suppliers
ADD CONSTRAINT supplier_profile_not_null
CHECK (
    -- If the status is 'APPROVED' or 'PENDING', profile_id must not be NULL
    (status IN ('APPROVED', 'PENDING', 'REJECTED') AND profile_id IS NOT NULL)
    -- If the status is 'CREATED', profile_id can be NULL
    OR (status = 'CREATED' AND profile_id IS NULL)
);
