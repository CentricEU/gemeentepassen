ALTER TABLE IF EXISTS l4l_global.restrictions
    ADD COLUMN created_date timestamp without time zone DEFAULT now() NOT NULL;