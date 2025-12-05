CREATE OR REPLACE FUNCTION l4l_security.remove_old_password_recovery()
  RETURNS integer
  LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM l4l_security.recover_password
  WHERE token_expiration_date <= current_date - INTERVAL '2 days';
  RETURN 1;
END;
$$;

