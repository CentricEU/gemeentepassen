-- Step 1: Create the municipality_profile table
CREATE TABLE l4l_security.municipality_profile (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    iban VARCHAR(18) NOT NULL,
    bic VARCHAR(11) NOT NULL,
    user_id uuid NOT NULL UNIQUE REFERENCES l4l_security.user(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_date timestamp without time zone DEFAULT now() NOT NULL
);

-- Step 2: Approve all users with the role 'municipality admin' (role_id = 0)
UPDATE l4l_security.user
SET is_approved = true
WHERE id IN (
    SELECT user_id
    FROM l4l_security.user_role
    WHERE role_id = 0
);

-- Step 3: Insert municipality profiles with placeholder NL IBAN and valid BIC for users with role_id = 0 (if not already present)
INSERT INTO l4l_security.municipality_profile (id, iban, bic, user_id)
SELECT uuid_generate_v1(), 'NL91ABNA0417164300', 'ABNANL2A', sub.user_id
FROM (
    SELECT DISTINCT u.id AS user_id
    FROM l4l_security.user u
    JOIN l4l_security.user_role ur ON u.id = ur.user_id
    WHERE ur.role_id = 0
) sub
WHERE NOT EXISTS (
    SELECT 1
    FROM l4l_security.municipality_profile mp
    WHERE mp.user_id = sub.user_id
);
