INSERT INTO l4l_global.citizen_benefit (user_id, benefit_id, amount)
SELECT 
    ph.user_id,
    b.id,
    b.amount
FROM l4l_global.passholders ph
JOIN l4l_global.benefit_citizen_group bcg
    ON ph.citizen_group_id = bcg.citizen_group_id
JOIN l4l_global.benefit b
    ON bcg.benefit_id = b.id
WHERE ph.user_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1
    FROM l4l_global.citizen_benefit cb
    WHERE cb.user_id = ph.user_id
      AND cb.benefit_id = b.id
);