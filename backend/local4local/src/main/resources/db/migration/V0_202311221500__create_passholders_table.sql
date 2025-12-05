CREATE TABLE l4l_global.passholders (
	id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	name character varying(256) NOT NULL,
	bsn character varying(32) NOT NULL,
	residence_city character varying(256) NOT NULL,
	pass_number character varying(64) NOT NULL,
	address character varying(256) NOT NULL,
	expiring_date date NOT NULL
);