	CREATE TABLE l4l_global.passholders_grants (
		passholder_id uuid REFERENCES l4l_global.passholders (id) ON UPDATE CASCADE ON DELETE CASCADE,
		grant_id uuid REFERENCES l4l_global.grants (id) ON UPDATE CASCADE ON DELETE CASCADE,
		CONSTRAINT passholder_grant_pkey PRIMARY KEY (passholder_id, grant_id)
	);