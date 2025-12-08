CREATE TABLE l4l_global.offer_search_history (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    search_keyword VARCHAR(255) NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL REFERENCES l4l_security.user(id) ON UPDATE CASCADE ON DELETE CASCADE
);
