CREATE TABLE l4l_global.working_hours (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
	day integer NOT NULL,
	open_time time without time zone NOT NULL,
	close_time time without time zone NOT NULL,
    supplier_id uuid NOT NULL,
	is_open boolean DEFAULT false,
	
	CONSTRAINT suppliers_fk FOREIGN KEY (supplier_id)
        REFERENCES l4l_security.suppliers (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);