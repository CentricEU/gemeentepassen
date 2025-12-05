	CREATE TYPE l4l_global.supplier_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
	);

	ALTER TABLE l4l_security.suppliers ADD COLUMN status l4l_global.supplier_status DEFAULT 'PENDING';
