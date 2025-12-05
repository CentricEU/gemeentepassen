ALTER TABLE IF EXISTS l4l_global.passholders
    ADD COLUMN tenant_id uuid REFERENCES l4l_security.tenants(id);