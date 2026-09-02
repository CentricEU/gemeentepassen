CREATE TYPE l4l_security.status_update_enum AS ENUM ('SIMPLE', 'WITH_CHANGES');

ALTER TABLE l4l_security.suppliers
ALTER COLUMN has_status_update DROP DEFAULT;

ALTER TABLE l4l_security.suppliers
RENAME COLUMN has_status_update TO status_update;

ALTER TABLE l4l_security.suppliers
ALTER COLUMN status_update TYPE l4l_security.status_update_enum
USING CASE
        WHEN status_update IS TRUE THEN 'SIMPLE'::l4l_security.status_update_enum
        ELSE NULL
    END;