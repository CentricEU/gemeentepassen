ALTER TABLE l4l_security.supplier_profile RENAME COLUMN supplier_profile_id TO id;
ALTER TABLE l4l_security.supplier_profile ADD PRIMARY KEY (id);

ALTER TABLE l4l_security.suppliers ADD profile_id uuid REFERENCES l4l_security.supplier_profile(id);
UPDATE l4l_security.suppliers s
	SET profile_id = (SELECT id FROM l4l_security.supplier_profile sp WHERE s.id = sp.supplier_id);