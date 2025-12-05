ALTER TABLE l4l_security."user" ADD COLUMN is_enabled BOOLEAN DEFAULT false;

UPDATE l4l_security."user" SET is_enabled = true;
