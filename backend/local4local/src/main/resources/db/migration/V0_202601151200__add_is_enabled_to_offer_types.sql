ALTER TABLE l4l_global.offer_type 
ADD COLUMN is_enabled boolean default true;

UPDATE l4l_global.offer_type SET is_enabled =false
WHERE offer_type_id = 1;

UPDATE l4l_global.offers SET offer_type_id = 5
where offer_type_id = 1;
