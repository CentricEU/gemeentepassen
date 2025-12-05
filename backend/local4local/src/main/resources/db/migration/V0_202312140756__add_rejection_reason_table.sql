CREATE TYPE l4l_global.rejection_reason AS ENUM (
    'NOT_IN_REGION',
    'MISBEHAVIOR',
    'IDLE',
    'INCOMPLETE_INFORMATION',
    'DUPLICATE'
	);

CREATE TABLE l4l_security.supplier_rejection (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    reason l4l_global.rejection_reason NOT NULL,
    comments VARCHAR(1024) DEFAULT NULL,
    supplier_id uuid NOT NULL REFERENCES l4l_security.suppliers(id)
);