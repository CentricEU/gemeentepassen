CREATE TABLE l4l_global.citizen_benefit (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES l4l_security.user(id)
        ON DELETE CASCADE,
    benefit_id uuid NOT NULL REFERENCES l4l_global.offers(id)
        ON DELETE CASCADE,
    amount numeric(10, 2)
);