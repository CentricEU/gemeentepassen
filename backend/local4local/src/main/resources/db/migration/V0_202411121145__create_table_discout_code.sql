CREATE TABLE l4l_global.discount_code (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    offer_id uuid NOT NULL REFERENCES l4l_global.offers(id),
    user_id uuid NOT NULL REFERENCES l4l_security.user(id),
    code VARCHAR(6) NOT NULL UNIQUE
);
