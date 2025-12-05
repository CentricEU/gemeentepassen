CREATE TYPE l4l_global.offer_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'EXPIRED'
);

ALTER TABLE l4l_global.offers ADD COLUMN status l4l_global.offer_status DEFAULT 'ACTIVE';
