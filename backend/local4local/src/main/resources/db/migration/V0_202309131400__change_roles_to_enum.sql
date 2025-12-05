	
DROP TABLE local4local_security.roles;
	
CREATE TYPE local4local_security.roles AS ENUM (
    'MUNICIPALITY_ADMIN',
    'SUPPLIER',
    'CITIZEN'
);


DROP TABLE local4local_global.tenants;

CREATE TABLE local4local_security.tenants (
	id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	name character varying(256) NOT NULL,
	address character varying(256),
	created_date timestamp DEFAULT now() NOT NULL
);


INSERT INTO local4local_security.tenants(
	 name, address)
	VALUES ( 'Iasi', 'str. Palat');
	
	
CREATE TABLE local4local_security.user(
    id uuid DEFAULT public.uuid_generate_v1() PRIMARY KEY,
    username character varying(256) NOT NULL,
    password character varying(256) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    tenant_id uuid REFERENCES local4local_security.tenants(id),
	role local4local_security.roles
);