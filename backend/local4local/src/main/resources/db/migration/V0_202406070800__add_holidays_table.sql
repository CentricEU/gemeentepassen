CREATE TABLE l4l_global.bank_holiday (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    country_code character varying(8) NOT NULL,
    local_name character varying(256) NOT NULL,
    day_date date NOT NULL,
	year integer NOT NULL
);