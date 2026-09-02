CREATE OR REPLACE PROCEDURE l4l_global.update_benefit_status()
LANGUAGE plpgsql
AS $$
BEGIN 
	UPDATE l4l_global.benefit
	SET status= 'EXPIRED'
	WHERE expiration_date < current_date;
END
$$;
