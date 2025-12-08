-- Delete ALL the previous entries
DELETE FROM l4l_global.citizen_group;

-- Drop the old unique constraint
ALTER TABLE l4l_global.citizen_group
DROP CONSTRAINT uq_group_name;

-- Add a new composite unique constraint on (tenant_id, group_name)
ALTER TABLE l4l_global.citizen_group
ADD CONSTRAINT uq_tenant_group_name UNIQUE (tenant_id, group_name);
