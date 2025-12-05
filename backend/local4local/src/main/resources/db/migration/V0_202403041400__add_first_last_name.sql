ALTER TABLE l4l_security.user DROP COLUMN full_name;

ALTER TABLE l4l_security.user ADD COLUMN first_name character varying(256) DEFAULT 'John';
ALTER TABLE l4l_security.user ADD COLUMN last_name character varying(256) DEFAULT 'Doe';
