CREATE SCHEMA local4local_security;

CREATE TABLE local4local_security.roles (
id uuid NOT NULL DEFAULT uuid_generate_v1(),
name character varying(32) NOT NULL,
role_weight smallint NOT NULL
);