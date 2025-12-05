CREATE TABLE l4l_security.login_attempt (
	id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	remote_addr character varying(256) NOT NULL,
	created_date timestamp DEFAULT now() NOT NULL,
	failed_count smallint DEFAULT 0 NOT NULL
);