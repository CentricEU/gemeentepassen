-- Step 1: Update supplier_profile: set category_id 3 or 4 to 1 and clear subcategory_id
UPDATE l4l_security.supplier_profile
SET category_id = 1,
    subcategory_id = NULL
WHERE category_id IN (3, 4);

-- Step 2: Remove categories with index 3 and 4
DELETE FROM l4l_global.profile_dropdowns_categories
WHERE id IN (3, 4);

-- Step 3: Insert new category types
INSERT INTO l4l_global.profile_dropdowns_categories (id, category_label)
VALUES
    (3, 'category.types.shop'),
    (4, 'category.types.other');

