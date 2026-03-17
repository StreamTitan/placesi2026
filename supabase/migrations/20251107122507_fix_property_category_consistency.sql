/*
  # Fix Property Category Consistency

  ## Summary
  This migration ensures all properties have consistent property_category values
  that align with the database schema expectations. It fixes any discrepancies
  between property_category and listing_type fields.

  ## Changes Made

  1. **Data Cleanup**
     - Update any properties where property_category='sale' to use 'buy'
     - Ensure property_category matches listing_type:
       * listing_type='sale' → property_category='buy'
       * listing_type='rent' → property_category='rent'

  2. **Validation**
     - Verify all active properties have valid property_category values
     - Check that property_general_type suffixes match property_category

  ## Important Notes
  - This is a data quality migration
  - No schema changes are made
  - Ensures consistency for search and filtering functionality
*/

-- Step 1: Fix any properties with property_category='sale' (should be 'buy')
UPDATE properties
SET property_category = 'buy'
WHERE property_category = 'sale';

-- Step 2: Ensure property_category matches listing_type
UPDATE properties
SET property_category = CASE
  WHEN listing_type = 'sale' THEN 'buy'
  WHEN listing_type = 'rent' THEN 'rent'
  ELSE property_category
END
WHERE 
  (listing_type = 'sale' AND property_category != 'buy') OR
  (listing_type = 'rent' AND property_category != 'rent');

-- Step 3: Fix property_general_type to match property_category
UPDATE properties
SET property_general_type = CASE
  WHEN property_category = 'rent' AND property_general_type NOT LIKE '%_rental' THEN
    property_general_type || '_rental'
  WHEN property_category = 'buy' AND property_general_type LIKE '%_rental' THEN
    REPLACE(property_general_type, '_rental', '')
  ELSE property_general_type
END
WHERE 
  (property_category = 'rent' AND property_general_type NOT LIKE '%_rental') OR
  (property_category = 'buy' AND property_general_type LIKE '%_rental');

-- Step 4: Add helpful comment
COMMENT ON COLUMN properties.property_category IS 
'Property category: "buy" for sale listings or "rent" for rental listings. Must align with listing_type.';
