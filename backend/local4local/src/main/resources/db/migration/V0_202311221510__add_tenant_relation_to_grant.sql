ALTER TABLE IF EXISTS l4l_security.grants
    ADD COLUMN tenant_id uuid REFERENCES l4l_security.tenants(id);