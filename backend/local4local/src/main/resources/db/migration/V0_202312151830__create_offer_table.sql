CREATE TYPE l4l_global.citizen_offer_type AS ENUM (
    'CITIZEN',
    'CITIZEN_WITH_PASS'
	);

CREATE TABLE l4l_global.offers (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    title character varying(255) NOT NULL,
	offer_type_id integer NOT NULL,
	amount integer,
    description character varying(1024) NOT NULL,
    citizen_offer_type l4l_global.citizen_offer_type DEFAULT 'CITIZEN',
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    expiration_date timestamp without time zone NOT NULL,
	
	CONSTRAINT offer_type_fk FOREIGN KEY (offer_type_id)
        REFERENCES l4l_global.offer_type (offer_type_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE l4l_global.offer_grants
(
    id serial NOT NULL,
    offer_id uuid NOT NULL,
    grant_id uuid NOT NULL,
    PRIMARY KEY (id),
    
    CONSTRAINT offer_fk FOREIGN KEY (offer_id)
        REFERENCES l4l_global.offers (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
		
	CONSTRAINT grant_fk FOREIGN KEY (grant_id)
        REFERENCES l4l_global.grants (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);