

	DROP TABLE l4l_security.grants;
	
	CREATE TABLE l4l_global.grants (
        id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
        title character varying(255) NOT NULL,
        description character varying(1024) NOT NULL,
        amount integer NOT NULL,
        create_for l4l_global.created_for DEFAULT 'PASS_OWNER',
        created_date timestamp without time zone DEFAULT now() NOT NULL,
        start_date timestamp without time zone DEFAULT now() NOT NULL,
        expiration_date timestamp without time zone NOT NULL
    );

