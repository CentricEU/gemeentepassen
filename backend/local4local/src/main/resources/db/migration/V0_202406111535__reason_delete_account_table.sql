CREATE TYPE l4l_security.account_deletion_reason AS ENUM (
    'NO_LONGER_USING',
    'NOT_USEFUL',
    'SAFETY_CONCERNS',
    'PRIVACY_CONCERNS',
    'OTHER_REASON'
);

CREATE TABLE l4l_security.deleted_users (
    id uuid DEFAULT uuid_generate_v1() PRIMARY KEY,
    user_id uuid NOT NULL,
    reason l4l_security.account_deletion_reason NOT NULL,

	CONSTRAINT user_fk FOREIGN KEY (user_id)
        REFERENCES l4l_security.user(id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);