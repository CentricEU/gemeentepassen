CREATE TABLE l4l_global.offer_rejection (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    reason VARCHAR(1024) NOT NULL,
    offer_id uuid NOT NULL REFERENCES l4l_global.offers(id)
);