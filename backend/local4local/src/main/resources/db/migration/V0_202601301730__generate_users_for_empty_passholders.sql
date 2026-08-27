DO $$
DECLARE
    pass_rec RECORD;
    new_user_id UUID;
BEGIN
    FOR pass_rec IN
        SELECT *
        FROM l4l_global.passholders
        WHERE user_id IS NULL
    LOOP
        INSERT INTO l4l_security."user" (
            username,
            password,
            tenant_id,
            first_name,
            last_name
        ) VALUES (
            pass_rec.bsn,
            gen_random_uuid()::text,
            pass_rec.tenant_id,
            pass_rec.name,
            pass_rec.name
        )
        RETURNING id INTO new_user_id;

        INSERT INTO l4l_security.user_role (user_id, role_id)
        VALUES (new_user_id, 2);

        UPDATE l4l_global.passholders
        SET user_id = new_user_id
        WHERE id = pass_rec.id;
    END LOOP;
END
$$;