DELETE FROM l4l_global.offer_transaction;

DELETE FROM l4l_global.discount_code;

DELETE from l4l_global.offer_rejection;

DELETE FROM l4l_global.offers;

DELETE FROM l4l_global.offer_type WHERE offer_type_label = 'offer.types.grant';
