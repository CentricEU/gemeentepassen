-- Add constraint to user table to make first_name and last_name not null

ALTER TABLE l4l_security."user"
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;