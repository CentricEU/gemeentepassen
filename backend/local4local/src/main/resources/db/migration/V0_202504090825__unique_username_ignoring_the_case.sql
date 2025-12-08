-- Drop the UNIQUE constraint
ALTER TABLE l4l_security."user" DROP CONSTRAINT IF EXISTS user_username_key;

-- Create a new case-insensitive UNIQUE index
CREATE UNIQUE INDEX unique_username_lower ON l4l_security."user" (LOWER(username));
