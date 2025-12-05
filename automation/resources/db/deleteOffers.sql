DELETE
FROM l4l_global.offers
WHERE supplier_id IN (SELECT supplier_id FROM l4l_security.user WHERE username = $1);
