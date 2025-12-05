CREATE TYPE l4l_global.frequency_of_use AS ENUM ('SINGLE_USE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TABLE l4l_global.restrictions (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    age_restriction INTEGER,
    frequency_of_use l4l_global.frequency_of_use,
    min_price INTEGER,
    max_price INTEGER,
    time_from TIME WITHOUT TIME ZONE,
    time_to TIME WITHOUT TIME ZONE
);


ALTER TABLE IF EXISTS l4l_global.offers
    ADD COLUMN restriction_id uuid REFERENCES l4l_global.restrictions(id);
