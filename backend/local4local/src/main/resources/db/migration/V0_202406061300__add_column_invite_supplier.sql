ALTER TABLE l4l_global.invite_supplier ADD COLUMN "is_active" BOOLEAN DEFAULT true;

DELETE FROM l4l_global.invite_supplier;


CREATE OR REPLACE FUNCTION update_invite_suppliers()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE l4l_global.invite_supplier invites
    SET is_active = false
    WHERE ((NEW.email = invites.email ) AND (NEW.id != invites.id ));
	NEW.is_active = true;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_invite_suppliers
BEFORE INSERT ON l4l_global.invite_supplier
FOR EACH ROW
EXECUTE FUNCTION update_invite_suppliers();