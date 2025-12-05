CREATE TABLE l4l_global.offer_transaction (
  id uuid DEFAULT uuid_generate_v1() PRIMARY KEY, 
  offer_id uuid NOT NULL, 
  citizen_id uuid NOT NULL, 
  amount numeric(8, 2), 
  created_date timestamp without time zone DEFAULT now() NOT NULL, 

  CONSTRAINT offer_fk FOREIGN KEY (offer_id) 
  REFERENCES l4l_global.offers (id) MATCH SIMPLE
  ON UPDATE CASCADE ON DELETE CASCADE, 

  CONSTRAINT citizen_fk FOREIGN KEY (citizen_id) 
  REFERENCES l4l_security.user (id) MATCH SIMPLE 
  ON UPDATE CASCADE ON DELETE CASCADE
);
