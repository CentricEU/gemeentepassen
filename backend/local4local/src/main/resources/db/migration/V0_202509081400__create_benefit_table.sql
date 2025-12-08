-- Step 1: Create an ENUM type for benefit types
CREATE TYPE l4l_global.benefit_type AS ENUM (
    'FREE_ACCESS_TO_FACILITIES',
    'CREDIT'
 );

-- Step 2: Create an ENUM type for facility types
CREATE TYPE l4l_global.facility_type AS ENUM (
     'PUBLIC_SWIMMING_POOLS',
     'MUSEUMS',
     'THEATERS',
     'CULTURAL_AND_SOCIAL_EVENTS'
  );

-- Step 3: Create the benefit table
CREATE TABLE l4l_global.benefit (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(256),
    benefit_type l4l_global.benefit_type NOT NULL,
    facility_types l4l_global.facility_type[] NOT NULL,
    start_date timestamp without time zone NOT NULL,
    expiration_date timestamp without time zone NOT NULL,
    tenant_id uuid NOT NULL REFERENCES l4l_security.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT uk_tenant_id_name UNIQUE (tenant_id, name)
);

-- Step 4: Create the benefit_citizen_group join table
CREATE TABLE l4l_global.benefit_citizen_group (
    benefit_id uuid NOT NULL REFERENCES l4l_global.benefit(id) ON UPDATE CASCADE ON DELETE CASCADE,
    citizen_group_id uuid NOT NULL REFERENCES l4l_global.citizen_group(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (benefit_id, citizen_group_id)
);

-- Step 5: Create index
CREATE INDEX ON l4l_global.benefit_citizen_group (citizen_group_id);