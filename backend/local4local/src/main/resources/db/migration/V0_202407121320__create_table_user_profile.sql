CREATE TABLE l4l_security.user_profile (
    id uuid PRIMARY KEY,
    address VARCHAR(1024),
    telephone VARCHAR(12),

	CONSTRAINT user_fk FOREIGN KEY (id)
        REFERENCES l4l_security."user" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);