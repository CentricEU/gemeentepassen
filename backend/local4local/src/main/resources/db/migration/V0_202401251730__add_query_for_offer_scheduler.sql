CREATE OR REPLACE PROCEDURE l4l_global.update_offer_status()
LANGUAGE plpgsql
AS $$
BEGIN 
	UPDATE l4l_global.offers
	SET status= 'EXPIRED'
	WHERE expiration_date < current_date;
END
$$;
