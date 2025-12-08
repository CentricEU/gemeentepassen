CREATE OR REPLACE PROCEDURE l4l_global.cleanup_offer_search_history()
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM l4l_global.offer_search_history
    WHERE id IN (
        SELECT id
        FROM (
            SELECT id,
                   user_id,
                   created_date,
                   ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_date DESC) AS rn
            FROM l4l_global.offer_search_history
        ) AS ranked
        WHERE rn > 5
    );
END
$$;
