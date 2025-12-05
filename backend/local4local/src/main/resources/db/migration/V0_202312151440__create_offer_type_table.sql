CREATE TABLE l4l_global.offer_type (
	offer_type_id serial NOT NULL,
	offer_type_label character varying(256) NOT NULL,
	PRIMARY KEY(offer_type_id)
);

INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (0,'offer.types.percentage');
INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (1,'offer.types.bogo');
INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (2,'offer.types.cash');
INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (3,'offer.types.seasonal');
INSERT INTO l4l_global.offer_type(offer_type_id,offer_type_label) VALUES (4,'offer.types.other');
