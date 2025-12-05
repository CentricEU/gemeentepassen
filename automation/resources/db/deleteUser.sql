BEGIN TRANSACTION;

DELETE FROM l4l_security.user_role
WHERE user_id IN (SELECT id FROM l4l_security."user" WHERE username = $1);

DELETE FROM l4l_security.supplier_profile
WHERE supplier_id IN (SELECT supplier_id FROM l4l_security."user" WHERE username = $1);

DELETE FROM l4l_security.refresh_token
WHERE user_id IN (SELECT id FROM l4l_security."user" WHERE username = $1);

DELETE FROM l4l_security."user"
WHERE username = $1;

DELETE FROM l4l_security.suppliers
WHERE admin_email = $1;

DELETE FROM l4l_security.verification_token
WHERE user_id IN (SELECT id FROM l4l_security."user" WHERE username = $1);

COMMIT;