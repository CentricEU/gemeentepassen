CREATE OR REPLACE FUNCTION update_users_is_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_reviewed AND NEW.is_profile_set THEN
    UPDATE l4l_security."user"
    SET is_approved = TRUE
    WHERE supplier_id = NEW.id;  
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_users_is_approved
AFTER UPDATE ON l4l_security.suppliers
FOR EACH ROW
EXECUTE FUNCTION update_users_is_approved();