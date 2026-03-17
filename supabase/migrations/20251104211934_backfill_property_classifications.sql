/*
  # Backfill Property Classification Fields

  ## Summary
  This migration ensures all existing properties have complete classification fields
  (property_category, property_general_type, property_style) based on their existing
  property_type and listing_type values.

  ## Changes Made
  
  1. **Set property_category based on listing_type**
     - Properties with listing_type = 'rent' → property_category = 'rent'
     - Properties with listing_type = 'sale' → property_category = 'buy'
     - Default to 'rent' if listing_type is null

  2. **Set property_style based on property_type**
     - 'apartment', 'townhouse', 'condo', 'flat' → 'apartment_townhouse'
     - 'house', 'home', 'villa', 'bungalow' → 'house'
     - 'land', 'plot', 'lot' → 'land'
     - 'office building' → 'office_building'
     - 'office space', 'office' → 'office_space'
     - 'warehouse' → 'warehouse'
     - 'venue' → 'venue'
     - Default to 'house' for unmatched residential types

  3. **Set property_general_type based on property_style and category**
     - Residential styles (apartment_townhouse, house) + rent → 'residential_rental'
     - Residential styles + buy → 'residential'
     - Commercial styles + rent → 'commercial_rental'
     - Commercial styles + buy → 'commercial'
     - Land style + rent → 'agricultural_rental'
     - Land style + buy → 'agricultural'

  ## Safety
  - Only updates properties where classification fields are NULL
  - Does not modify properties that already have classifications
  - Uses CASE statements for safe, predictable mapping
*/

-- Step 1: Update property_category based on listing_type
UPDATE properties
SET property_category = CASE 
  WHEN listing_type = 'rent' THEN 'rent'
  WHEN listing_type = 'sale' THEN 'buy'
  ELSE 'rent'
END
WHERE property_category IS NULL;

-- Step 2: Update property_style based on property_type
UPDATE properties
SET property_style = CASE
  -- Apartment/Townhouse types
  WHEN LOWER(property_type) IN ('apartment', 'townhouse', 'condo', 'flat', 'condominium') 
    THEN 'apartment_townhouse'
  
  -- House types
  WHEN LOWER(property_type) IN ('house', 'home', 'villa', 'bungalow', 'detached', 'semi-detached') 
    THEN 'house'
  
  -- Land types
  WHEN LOWER(property_type) IN ('land', 'plot', 'lot', 'parcel') 
    THEN 'land'
  
  -- Commercial types
  WHEN LOWER(property_type) LIKE '%office building%' OR LOWER(property_type) = 'office building'
    THEN 'office_building'
  
  WHEN LOWER(property_type) LIKE '%office space%' OR LOWER(property_type) IN ('office', 'office space')
    THEN 'office_space'
  
  WHEN LOWER(property_type) = 'warehouse' 
    THEN 'warehouse'
  
  WHEN LOWER(property_type) = 'venue' 
    THEN 'venue'
  
  -- Fallback: if it contains commercial/business/office keywords
  WHEN LOWER(property_type) LIKE '%commercial%' OR LOWER(property_type) LIKE '%business%'
    THEN 'office_space'
  
  -- Default fallback for unmatched residential
  ELSE 'house'
END
WHERE property_style IS NULL;

-- Step 3: Update property_general_type based on property_style and property_category
UPDATE properties
SET property_general_type = CASE
  -- Residential styles
  WHEN property_style IN ('apartment_townhouse', 'house') AND property_category = 'rent'
    THEN 'residential_rental'
  
  WHEN property_style IN ('apartment_townhouse', 'house') AND property_category = 'buy'
    THEN 'residential'
  
  -- Commercial styles
  WHEN property_style IN ('office_building', 'office_space', 'warehouse', 'venue') AND property_category = 'rent'
    THEN 'commercial_rental'
  
  WHEN property_style IN ('office_building', 'office_space', 'warehouse', 'venue') AND property_category = 'buy'
    THEN 'commercial'
  
  -- Land/Agricultural
  WHEN property_style = 'land' AND property_category = 'rent'
    THEN 'agricultural_rental'
  
  WHEN property_style = 'land' AND property_category = 'buy'
    THEN 'agricultural'
  
  -- Fallback
  WHEN property_category = 'rent'
    THEN 'residential_rental'
  ELSE 'residential'
END
WHERE property_general_type IS NULL;

-- Step 4: Ensure listing_type is consistent with property_category
UPDATE properties
SET listing_type = CASE
  WHEN property_category = 'rent' THEN 'rent'
  WHEN property_category = 'buy' THEN 'sale'
  ELSE listing_type
END
WHERE listing_type IS NULL OR 
      (property_category = 'rent' AND listing_type != 'rent') OR
      (property_category = 'buy' AND listing_type != 'sale');

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM properties
  WHERE property_category IS NOT NULL 
    AND property_general_type IS NOT NULL 
    AND property_style IS NOT NULL;
  
  RAISE NOTICE 'Backfill complete: % properties now have complete classifications', updated_count;
END $$;
