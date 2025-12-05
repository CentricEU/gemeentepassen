ALTER TABLE IF EXISTS l4l_security.suppliers
    ADD COLUMN "is_profile_set" boolean DEFAULT false;

ALTER TABLE IF EXISTS l4l_security.suppliers
    ADD COLUMN "is_reviewed" boolean DEFAULT false;