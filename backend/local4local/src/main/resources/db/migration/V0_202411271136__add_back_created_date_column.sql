ALTER TABLE l4l_global.offer_transaction
DROP COLUMN validation_date;


ALTER TABLE l4l_global.offer_transaction
ADD COLUMN created_date TIMESTAMP DEFAULT now() NOT NULL;