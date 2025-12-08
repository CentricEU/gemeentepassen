-- Make group_name unique in citizen_group table
ALTER TABLE l4l_global.citizen_group
ADD CONSTRAINT uq_group_name UNIQUE (group_name);