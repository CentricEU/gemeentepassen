CREATE SEQUENCE hibernate_sequence START 1;

CREATE TABLE l4l_security.recover_password (
    recover_password_id serial NOT NULL,
	token character varying(64) NOT NULL,
	token_expiration_date timestamp without time zone DEFAULT now() NOT NULL,
	user_id uuid REFERENCES l4l_security.user(id)
);