CREATE EXTENSION postgis;

ALTER TABLE l4l_security.supplier_profile ADD COLUMN coordinates_string character varying(256) DEFAULT '{"longitude":4.6313375,"latitude":52.03413475}';
ALTER TABLE l4l_security.supplier_profile ADD COLUMN coordinates geometry(Geometry,28992) DEFAULT ST_SetSRID(ST_MakePoint(4.6313375, 52.03413475), 28992);


CREATE OR REPLACE FUNCTION l4l_security.transform_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.coordinates = ST_SetSRID(new.coordinates, 28992);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trig_insert_coordinates BEFORE INSERT ON l4l_security.supplier_profile FOR EACH ROW EXECUTE FUNCTION l4l_security.transform_coordinates();
CREATE OR REPLACE TRIGGER trig_update_coordinates BEFORE UPDATE ON l4l_security.supplier_profile FOR EACH ROW EXECUTE FUNCTION l4l_security.transform_coordinates();

