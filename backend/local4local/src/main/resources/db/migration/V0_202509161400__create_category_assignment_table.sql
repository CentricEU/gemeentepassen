-- Create the `category-assignment` table in the `l4l_global` schema
CREATE TABLE l4l_global.citizen_group_assignment (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    citizen_group_id uuid NOT NULL REFERENCES l4l_global.citizen_group ON UPDATE CASCADE ON DELETE CASCADE,
    citizen_id uuid NOT NULL REFERENCES l4l_security.user ON UPDATE CASCADE ON DELETE CASCADE,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT uq_citizen UNIQUE (citizen_id)
);