DELETE FROM l4l_global.invite_supplier;

ALTER TABLE l4l_global.invite_supplier
ALTER COLUMN is_registered SET DEFAULT FALSE,
ALTER COLUMN token SET DEFAULT uuid_generate_v1(),
ALTER COLUMN token_expiration_date SET DEFAULT (NOW() + INTERVAL '2 days');

ALTER TABLE l4l_global.invite_supplier
ALTER COLUMN is_registered SET NOT NULL,
ALTER COLUMN token SET NOT NULL,
ALTER COLUMN token_expiration_date SET NOT NULL;