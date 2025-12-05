
ALTER TABLE l4l_global.offers DROP COLUMN coordinates;
ALTER TABLE l4l_security.supplier_profile DROP COLUMN coordinates;

ALTER TABLE l4l_security.supplier_profile ADD COLUMN coordinates geometry(Geometry,4326) DEFAULT ST_SetSRID(ST_MakePoint(4.6313375, 52.03413475), 4326);
ALTER TABLE l4l_global.offers ADD COLUMN coordinates geometry(Geometry,4326) DEFAULT ST_SetSRID(ST_MakePoint(4.6313375, 52.03413475), 4326);


CREATE OR REPLACE FUNCTION l4l_security.transform_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.coordinates = ST_SetSRID(new.coordinates, 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION l4l_security.bulk_update_offer_coordinates()
RETURNS void AS
$$
BEGIN
    UPDATE l4l_global.offers
    SET coordinates = ST_SetSRID(ST_MakePoint(
        (CAST(coordinates_string AS jsonb)->>'longitude')::double precision,
        (CAST(coordinates_string AS jsonb)->>'latitude')::double precision
    ), 4326);
END;
$$
LANGUAGE plpgsql;

SELECT l4l_security.bulk_update_offer_coordinates();




