
ALTER TABLE l4l_global.offers ADD COLUMN coordinates_string character varying(256) DEFAULT '{"longitude":4.6313375,"latitude":52.03413475}';
ALTER TABLE l4l_global.offers ADD COLUMN coordinates geometry(Geometry,28992) DEFAULT ST_SetSRID(ST_MakePoint(4.6313375, 52.03413475), 28992);

CREATE OR REPLACE FUNCTION l4l_security.update_offers_coords()
RETURNS TRIGGER AS $$

DECLARE
   sup_id uuid;

BEGIN

	SELECT id INTO sup_id FROM l4l_security.suppliers WHERE profile_id = NEW.id;

	UPDATE l4l_global.offers SET coordinates_string = NEW.coordinates_string, coordinates= NEW.coordinates
		WHERE supplier_id = sup_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trig_update_offer_coordinates AFTER UPDATE ON l4l_security.supplier_profile FOR EACH ROW EXECUTE FUNCTION l4l_security.update_offers_coords();
