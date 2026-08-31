WITH oldest_active_admins AS (
SELECT DISTINCT ON (u.tenant_id) u.id
    FROM l4l_security.user u
	JOIN l4l_security.user_role ur ON u.id = ur.user_id
    WHERE u.is_enabled = TRUE
	AND ur.role_id = (SELECT id FROM l4l_security.role WHERE name = 'ROLE_MUNICIPALITY_ADMIN')
    ORDER BY u.tenant_id, u.created_date ASC
)

UPDATE l4l_security.user_role ur
	SET role_id = (SELECT id FROM l4l_security.role WHERE name = 'ROLE_SUPER_ADMIN')
	FROM oldest_active_admins ad
	WHERE ad.id = ur.user_id
	AND ur.role_id = (SELECT id FROM l4l_security.role WHERE name = 'ROLE_MUNICIPALITY_ADMIN');