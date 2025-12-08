ALTER TABLE IF EXISTS l4l_security.user
    ADD COLUMN "credentials_expired" boolean DEFAULT false;