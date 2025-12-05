CREATE TABLE l4l_security.role (
    id serial PRIMARY KEY,
    name character varying(256) NOT NULL
);

INSERT INTO l4l_security.role(id,name) VALUES (0,'ROLE_MUNICIPALITY_ADMIN');
INSERT INTO l4l_security.role(id,name) VALUES (1,'ROLE_SUPPLIER');

CREATE TABLE l4l_security.user_role(
    id serial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES l4l_security.user(id),
    role_id integer NOT NULL REFERENCES l4l_security.role(id)
);

INSERT INTO l4l_security.user_role(user_id, role_id)
  SELECT id, 0 from l4l_security.user WHERE supplier_id IS NULL;
INSERT INTO l4l_security.user_role(user_id, role_id)
  SELECT id, 1 from l4l_security.user WHERE supplier_id IS NOT NULL;
