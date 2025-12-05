CREATE TABLE l4l_security.verification_token (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    user_id uuid NOT NULL,
    token character varying(128) NOT NULL,
    expiration_date timestamp without time zone NOT NULL,

    CONSTRAINT user_id_fk FOREIGN KEY (user_id)
    REFERENCES l4l_security.user (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
