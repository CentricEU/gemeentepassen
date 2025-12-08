DELETE FROM l4l_global.offer_transaction;

DELETE FROM l4l_global.discount_code;

DELETE from l4l_global.offer_rejection;

DELETE FROM l4l_global.offers;


ALTER TABLE IF EXISTS l4l_global.offers
    ADD COLUMN benefit_id uuid REFERENCES l4l_global.benefit(id)
	ON DELETE CASCADE;