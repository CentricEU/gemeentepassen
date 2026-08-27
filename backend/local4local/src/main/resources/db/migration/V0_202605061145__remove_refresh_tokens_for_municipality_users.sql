-- This migration removes refresh tokens for users with the 'ROLE_MUNICIPALITY_ADMIN' role.
-- This is necessary to ensure that these users will be required to re-authenticate and obtain new refresh tokens, which may be part of a security update or role change.
DELETE FROM l4l_security.refresh_token
WHERE user_id IN (
    SELECT ur.user_id
    FROM l4l_security.user_role ur
    WHERE ur.role_id = 0
);