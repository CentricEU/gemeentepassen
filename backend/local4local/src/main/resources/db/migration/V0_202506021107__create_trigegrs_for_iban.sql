CREATE OR REPLACE FUNCTION update_municipality_admins_on_tenant_iban()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act if IBAN becomes not null
  IF NEW.iban IS NOT NULL AND (OLD.iban IS NULL) THEN
    UPDATE l4l_security.user u
    SET is_approved = true
    WHERE u.id IN (
      SELECT ur.user_id
      FROM l4l_security.user_role ur
      JOIN l4l_security.role r ON ur.role_id = r.id
      WHERE r.id = 0
        AND u.tenant_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_municipality_admins_on_tenant_iban
AFTER UPDATE OF iban ON l4l_security.tenants
FOR EACH ROW
EXECUTE FUNCTION update_municipality_admins_on_tenant_iban();


CREATE OR REPLACE FUNCTION approve_municipality_admin_on_userrole_insert()
RETURNS TRIGGER AS $$
DECLARE
  tenant_iban TEXT;
  user_tenant_id UUID;
BEGIN
  -- Only if the role_id is 0 (MUNICIPALITY_ADMIN)
  IF NEW.role_id = 0 THEN
    -- Get the tenant_id for the user
    SELECT tenant_id INTO user_tenant_id
    FROM l4l_security.user
    WHERE id = NEW.user_id;

    -- Get the IBAN of the tenant
    SELECT iban INTO tenant_iban
    FROM l4l_security.tenants
    WHERE id = user_tenant_id;

    -- Set is_approved based on whether IBAN is filled
    UPDATE l4l_security.user
    SET is_approved = CASE
        WHEN tenant_iban IS NOT NULL AND tenant_iban != '' THEN true
        ELSE false
      END
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_approve_municipality_admin_on_userrole_insert
AFTER INSERT ON l4l_security.user_role
FOR EACH ROW
EXECUTE FUNCTION approve_municipality_admin_on_userrole_insert();

