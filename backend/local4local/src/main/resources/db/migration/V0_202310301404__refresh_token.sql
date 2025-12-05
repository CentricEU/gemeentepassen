CREATE TABLE l4l_security.refresh_token (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    user_id uuid NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES l4l_security.user(id),
    UNIQUE (token)
);