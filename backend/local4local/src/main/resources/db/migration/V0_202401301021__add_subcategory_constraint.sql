--Add a constraint to guarantee that each category has only one specified subcategory--

ALTER TABLE l4l_security.supplier_profile
ADD CONSTRAINT check_relationship_profile_dropdowns
CHECK (
    (category_id IN (0) AND subcategory_id IN (0, 1)) OR
    (category_id IN (5) AND subcategory_id IN (2)) OR
    (category_id IN (1, 2, 3, 4) AND subcategory_id IS NULL)
) NOT VALID;
