ALTER TABLE IF EXISTS l4l_global.offers
    ADD COLUMN supplier_id uuid REFERENCES l4l_security.suppliers(id);