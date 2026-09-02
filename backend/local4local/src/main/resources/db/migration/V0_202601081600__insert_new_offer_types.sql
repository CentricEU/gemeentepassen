UPDATE l4l_global.offer_type SET offer_type_label='offer.types.storeCredit'
WHERE offer_type_id = 1;

UPDATE l4l_global.offer_type SET offer_type_label='offer.types.membershipFee'
WHERE offer_type_id = 3;

INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (5,'offer.types.freeProduct');