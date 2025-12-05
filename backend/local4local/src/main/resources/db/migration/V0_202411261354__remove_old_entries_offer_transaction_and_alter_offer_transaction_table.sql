DELETE FROM l4l_global.offer_transaction;

ALTER TABLE l4l_global.offer_transaction
DROP COLUMN offer_id,
DROP COLUMN citizen_id;

ALTER TABLE l4l_global.offer_transaction
ADD COLUMN discount_code_id UUID,
ADD CONSTRAINT fk_discount_code FOREIGN KEY (discount_code_id) REFERENCES l4l_global.discount_code (id);


ALTER TABLE l4l_global.offer_transaction
ADD COLUMN validation_date TIMESTAMP DEFAULT now() NOT NULL;
