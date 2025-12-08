CREATE TABLE l4l_global.passes (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    first_name character varying(128) NOT NULL,
    last_name character varying(128) NOT NULL,
    birthday date NOT NULL,
    bsn character varying(32) NOT NULL,
    contact_phone character varying(12) NOT NULL,
    contact_email character varying(256) NOT NULL,
    additional_info character varying(1024)
);