CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE SCHEMA local4local_global;

CREATE TABLE local4local_global.tenants (
	id uuid NOT NULL DEFAULT uuid_generate_v1(),
	name character varying(256) NOT NULL,
	address character varying(256),
	created_date timestamp DEFAULT now() NOT NULL
);


INSERT INTO local4local_global.tenants(
	 name, address)
	VALUES ( 'Iasi', 'str. Palat');