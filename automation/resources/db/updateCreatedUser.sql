UPDATE l4l_security.user
SET is_enabled = true
WHERE username = $1;