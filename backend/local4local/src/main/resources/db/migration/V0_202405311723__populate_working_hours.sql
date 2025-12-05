DO $$
DECLARE
    supplier RECORD;
    day INTEGER;
    days INTEGER[] := ARRAY[1, 2, 3, 4, 5, 6, 7];
BEGIN
    FOR supplier IN
        SELECT s.id
        FROM l4l_security.suppliers s
        JOIN l4l_security.user u ON s.id = u.supplier_id
        WHERE u.is_enabled = true AND s.is_profile_set = true
    LOOP
      IF NOT EXISTS (
                SELECT 1 FROM l4l_global.working_hours wh
                WHERE wh.supplier_id = supplier.id
            ) THEN
            FOREACH day IN ARRAY days LOOP
                INSERT INTO l4l_global.working_hours (day, open_time, close_time, supplier_id, is_checked)
                VALUES (day, '00:00:00', '00:00:00', supplier.id, false);
            END LOOP;
      END IF;
    END LOOP;
END $$;
