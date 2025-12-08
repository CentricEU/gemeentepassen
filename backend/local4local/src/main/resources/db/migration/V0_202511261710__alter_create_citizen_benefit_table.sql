ALTER TABLE l4l_global.citizen_benefit
DROP CONSTRAINT IF EXISTS citizen_benefit_benefit_id_fkey;

ALTER TABLE l4l_global.citizen_benefit
ADD CONSTRAINT citizen_benefit_benefit_id_fkey
FOREIGN KEY (benefit_id) REFERENCES l4l_global.benefit(id)
ON DELETE CASCADE;

ALTER TABLE l4l_global.citizen_benefit
DROP COLUMN IF EXISTS created_date;

ALTER TABLE l4l_global.citizen_benefit 
ADD COLUMN created_date timestamp without time zone DEFAULT now() NOT NULL;