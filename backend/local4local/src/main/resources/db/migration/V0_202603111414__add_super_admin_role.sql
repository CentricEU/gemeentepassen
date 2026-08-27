-- This migration adds the ROLE_SUPER_ADMIN role to the l4l_security.role table.
INSERT INTO l4l_security.role(id,name) VALUES (4,'ROLE_SUPER_ADMIN');

 