-- Delete ALL the previous entries
DELETE FROM l4l_global.citizen_group;

-- Add a new column 'tenant_id' to the 'citizen_groups' table
ALTER TABLE l4l_global.citizen_group
ADD COLUMN tenant_id uuid NOT NULL,
ADD CONSTRAINT fk_citizen_group_tenant
    FOREIGN KEY (tenant_id) REFERENCES l4l_security.tenants(id) ON DELETE CASCADE;

