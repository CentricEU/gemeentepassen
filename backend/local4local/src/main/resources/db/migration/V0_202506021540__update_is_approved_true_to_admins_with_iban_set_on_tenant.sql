UPDATE l4l_security.user u
SET is_approved = true
WHERE u.is_approved = false
  AND u.id IN (
    SELECT ur.user_id
    FROM l4l_security.user_role ur
    WHERE ur.role_id = 0
  )
  AND u.tenant_id IN (
    SELECT t.id
    FROM l4l_security.tenants t
    WHERE t.iban IS NOT NULL AND t.iban != ''
  );
