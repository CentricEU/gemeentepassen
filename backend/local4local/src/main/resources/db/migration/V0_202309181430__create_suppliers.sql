CREATE TABLE l4l_security.suppliers (
	id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	company_name character varying(256) NOT NULL,
	kvk character varying(8) NOT NULL,
	created_date timestamp DEFAULT now() NOT NULL,
	tenant_id uuid REFERENCES l4l_security.tenants(id)
);

DROP TABLE l4l_security.user;

CREATE TABLE l4l_security.user(
    id uuid DEFAULT public.uuid_generate_v1() PRIMARY KEY,
    username character varying(256) NOT NULL,
    full_name character varying(256) NOT NULL,
    password character varying(256) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    tenant_id uuid REFERENCES l4l_security.tenants(id),
	role l4l_security.roles,
	supplier_id uuid REFERENCES l4l_security.suppliers(id)
);
