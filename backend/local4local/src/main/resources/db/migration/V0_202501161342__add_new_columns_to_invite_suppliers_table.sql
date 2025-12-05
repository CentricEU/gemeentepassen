-- Add new columns to the invite_supplier table
-- is_registered: boolean column to check if the supplier has registered
-- token: UUID column to store the token
-- token_expiration_date: timestamp column to store the expiration date of the token
-- all the columns are optional

ALTER TABLE l4l_global.invite_supplier
ADD COLUMN is_registered boolean,
ADD COLUMN token uuid,
ADD COLUMN token_expiration_date timestamp without time zone;