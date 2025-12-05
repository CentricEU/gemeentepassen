ALTER TABLE l4l_security.supplier_profile
ALTER COLUMN subcategory_id DROP NOT NULL;

ALTER TABLE l4l_global.profile_dropdowns_subcategories
ALTER COLUMN subcategory_label DROP NOT NULL;