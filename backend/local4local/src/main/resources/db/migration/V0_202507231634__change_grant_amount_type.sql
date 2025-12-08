-- Change the type of the amount column in the grants table to NUMERIC(8,2)
ALTER TABLE l4l_global.grants
ALTER COLUMN amount TYPE NUMERIC(8,2);