UPDATE l4l_security.user u
SET is_active = TRUE
FROM l4l_security.user_role ur
WHERE ur.user_id = u.id
  AND ur.role_id = 2
  AND u.username NOT LIKE 'delete_%';
