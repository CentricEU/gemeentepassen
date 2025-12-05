--Tables for translations--

CREATE TABLE l4l_global.profile_dropdowns_categories (
	id serial NOT NULL,
        category_label character varying(256) NOT NULL,
	PRIMARY KEY(id)
);

INSERT INTO l4l_global.profile_dropdowns_categories (id, category_label)
VALUES 
    (0, 'category.types.culture'),
    (1, 'category.types.sport'),
    (2, 'category.types.foodAndDrinks'),
    (3, 'category.types.dance'),
    (4, 'category.types.courses'),
    (5, 'category.types.music');

CREATE TABLE l4l_global.profile_dropdowns_subcategories (
	id serial NOT NULL,
        subcategory_label character varying(256) NOT NULL,
        category_id INT REFERENCES l4l_global.profile_dropdowns_categories(id),
	PRIMARY KEY(id)
);

INSERT INTO l4l_global.profile_dropdowns_subcategories (id, subcategory_label, category_id)
VALUES 
    (0, 'subcategory.types.museums', 0),
    (1, 'subcategory.types.theatre', 0),
    (2, 'subcategory.types.singing', 5);
    
CREATE TABLE l4l_global.profile_dropdowns_legal_form (
	id serial NOT NULL,
        legal_form_label character varying(256) NOT NULL,
	PRIMARY KEY(id)
);

INSERT INTO l4l_global.profile_dropdowns_legal_form (id, legal_form_label)
VALUES 
    (0, 'legalForm.types.sole'),
    (1, 'legalForm.types.foundation'),
    (2, 'legalForm.types.association'),
    (3, 'legalForm.types.cooperative'),
    (4, 'legalForm.types.publicLimitedCompany'),
    (5, 'legalForm.types.privateLimitedCompany'),
    (6, 'legalForm.types.limitedPartnership'),
    (7, 'legalForm.types.publicPartnership'),
    (8, 'legalForm.types.commercialPartnership');


CREATE TABLE l4l_global.profile_dropdowns_groups (
	id serial NOT NULL,
        group_label character varying(256) NOT NULL,
	PRIMARY KEY(id)
);

INSERT INTO l4l_global.profile_dropdowns_groups (id, group_label)
VALUES 
    (0, 'group.types.commercial'),
    (1, 'group.types.public'),
    (2, 'group.types.association'),
    (3, 'group.types.social');

-- Add fks for supplier-profile--

ALTER TABLE l4l_security.supplier_profile
DROP COLUMN legal_form, DROP COLUMN group_name, DROP COLUMN category, DROP COLUMN subcategory ;

ALTER TABLE l4l_security.supplier_profile
ADD COLUMN legal_form_id serial NOT NULL,
ADD COLUMN group_name_id serial NOT NULL,
ADD COLUMN category_id serial NOT NULL,
ADD COLUMN subcategory_id serial;

UPDATE l4l_security.supplier_profile
SET 
  legal_form_id = 0,
  group_name_id = 0,
  category_id = 0,
  subcategory_id = 0;

ALTER TABLE l4l_security.supplier_profile
ADD CONSTRAINT fk_legal_form_id FOREIGN KEY (legal_form_id) REFERENCES l4l_global.profile_dropdowns_legal_form (id),
ADD CONSTRAINT fk_group_name_id FOREIGN KEY (group_name_id) REFERENCES l4l_global.profile_dropdowns_groups (id),
ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES l4l_global.profile_dropdowns_categories (id),
ADD CONSTRAINT fk_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES l4l_global.profile_dropdowns_subcategories (id);



