
ALTER TABLE IF EXISTS l4l_security.suppliers
    ADD COLUMN has_status_update boolean DEFAULT false;
