ALTER TABLE l4l_security.supplier_profile DROP COLUMN company_name;
ALTER TABLE l4l_security.supplier_profile DROP COLUMN kvk;

ALTER TABLE l4l_security.suppliers ADD admin_email character varying(256);
UPDATE l4l_security.suppliers s
	SET admin_email = (SELECT admin_email FROM l4l_security.supplier_profile sp WHERE s.id = sp.supplier_id);
UPDATE l4l_security.suppliers s
	SET admin_email = (SELECT username from l4l_security.user WHERE supplier_id=s.id LIMIT 1) WHERE admin_email IS NULL;

ALTER TABLE l4l_security.suppliers ALTER COLUMN admin_email SET NOT NULL;
ALTER TABLE l4l_security.supplier_profile DROP COLUMN admin_email;


