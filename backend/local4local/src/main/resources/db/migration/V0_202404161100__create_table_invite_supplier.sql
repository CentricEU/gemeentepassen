CREATE TABLE l4l_global.invite_supplier (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	created_date timestamp without time zone DEFAULT now() NOT NULL,
	email character varying(256) NOT NULL,
	message character varying(1024) NOT NULL,
	tenant_id uuid NOT NULL,

	CONSTRAINT tenant_fk FOREIGN KEY (tenant_id)
        REFERENCES l4l_security.tenants (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);