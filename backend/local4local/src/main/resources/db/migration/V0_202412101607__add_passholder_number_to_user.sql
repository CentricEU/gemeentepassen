
DELETE FROM l4l_global.passholders
    WHERE tenant_id IS NULL
    OR pass_number IN (
        SELECT pass_number
        FROM l4l_global.passholders
        GROUP BY pass_number
        HAVING COUNT(*) > 1
    )
    OR bsn IN (
        SELECT bsn
        FROM l4l_global.passholders
        GROUP BY bsn
        HAVING COUNT(*) > 1
    );

DELETE FROM l4l_global.offer_transaction;
DELETE FROM l4l_global.discount_code;

DELETE FROM l4l_security.refresh_token
WHERE user_id IN (
    SELECT u.id
    FROM l4l_security.user u
    INNER JOIN l4l_security.user_role ur ON u.id = ur.user_id
    WHERE ur.role_id = 2
);

DELETE FROM l4l_security.user_role WHERE role_id = 2;
DELETE FROM l4l_security.user_profile WHERE id NOT IN (SELECT user_id FROM l4l_security.user_role);
DELETE FROM l4l_security.user WHERE id NOT IN (SELECT user_id FROM l4l_security.user_role);

ALTER TABLE l4l_global.passholders ADD COLUMN user_id UUID REFERENCES l4l_security.user(id),
ADD CONSTRAINT unique_pass_number UNIQUE (pass_number),
ADD CONSTRAINT unique_bsn UNIQUE (bsn);


