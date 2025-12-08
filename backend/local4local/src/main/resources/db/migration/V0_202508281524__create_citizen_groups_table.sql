-- Step 1: create an ENUM type for age groups
CREATE TYPE l4l_global.age_group AS ENUM (
    'UNDER_18',
    'AGE_18_64',
    'AGE_65_PLUS'
 );

-- Step 2: create an ENUM for eligibility criteria
CREATE TYPE l4l_global.eligibility_criteria AS ENUM (
    'HAS_EXISTING_DIGID',
    'IS_AGE_18_OR_OLDER',
    'RESIDES_IN_CITY',
    'IS_NOT_A_STUDENT'
 );

-- Step 3: create an ENUM for required documents
CREATE TYPE l4l_global.required_documents AS ENUM (
    'PROOF_OF_IDENTITY',
    'INCOME_PROOF',
    'ASSETS',
    'DEBTS_OR_ALIMONY_OBLIGATIONS'
 );

-- Step 4: Create the citizen_group table
-- id: UUID primary key
-- group_name: the name of the citizen group
-- age_group: an array of age groups (using the ENUM type)
-- includes_dependent_children: boolean indicating if the group includes dependent children
-- threshold_amount: numeric(5,2) representing the threshold amount for eligibility (between 0 and 200)
-- max_income: numeric(10,2) representing the maximum income for eligibility computed based on household size
-- eligibility_criteria: an array of eligibility criteria (using the ENUM type)
-- required_documents: an array of required documents (using the ENUM type)
CREATE TABLE l4l_global.citizen_group (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    group_name VARCHAR(64) NOT NULL,
    age_group l4l_global.age_group[] NOT NULL,
    includes_dependent_children BOOLEAN DEFAULT false NOT NULL,
    threshold_amount NUMERIC(5,2) NOT NULL CHECK (threshold_amount BETWEEN 1 AND 200),
    max_income NUMERIC(10, 2) NOT NULL,
    eligibility_criteria l4l_global.eligibility_criteria[] NOT NULL,
    required_documents l4l_global.required_documents[] NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL
);