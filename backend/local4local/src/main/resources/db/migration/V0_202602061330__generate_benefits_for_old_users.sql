DO $$
BEGIN
    INSERT INTO l4l_global.citizen_benefit (
        user_id,
        benefit_id,
        amount,
        created_date
    )
    SELECT
        ph.user_id,
        bcg.benefit_id,
        b.amount,
        NOW() AS created_date
    FROM
        l4l_global.passholders ph
    JOIN
        l4l_global.benefit_citizen_group bcg ON ph.citizen_group_id = bcg.citizen_group_id
    JOIN
        l4l_global.benefit b ON bcg.benefit_id = b.id
    LEFT JOIN
        l4l_global.citizen_benefit cb
        ON cb.user_id = ph.user_id
        AND cb.benefit_id = bcg.benefit_id
    WHERE
        cb.id IS NULL;
END
$$;