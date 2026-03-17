/*
  # Add Property Classification System

  1. Overview
    This migration adds a comprehensive three-tier property classification system
    to support more granular property categorization for Buy/Rent listings.

  2. New Columns
    - `property_category` (text): Main category - 'buy' or 'rent'
    - `property_general_type` (text): General type based on category
      * For Buy: 'agricultural', 'commercial', 'residential'
      * For Rent: 'agricultural_rental', 'commercial_rental', 'residential_rental'
    - `property_style` (text): Specific property style/sub-type
      * Common: 'apartment_townhouse', 'house', 'land'
      * Commercial: 'office_building', 'office_space', 'venue', 'warehouse'

  3. Data Migration
    - Convert existing `listing_type` to `property_category`
    - Map existing `property_type` values to new classification system
    - Set appropriate defaults for existing records

  4. Indexes
    - Add indexes on new columns for efficient filtering
    - Composite index for common query patterns

  5. Security
    - No RLS changes needed (inherits from existing properties policies)

  6. Notes
    - Maintains backward compatibility with existing `property_type` field
    - All new fields are NOT NULL with defaults for data integrity
    - Property styles are flexible text fields to allow for future expansion
*/

-- Step 1: Add new property_category column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_category'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_category text DEFAULT 'buy' NOT NULL;
  END IF;
END $$;

-- Step 2: Add new property_general_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_general_type'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_general_type text DEFAULT 'residential' NOT NULL;
  END IF;
END $$;

-- Step 3: Add new property_style column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_style'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_style text DEFAULT 'house' NOT NULL;
  END IF;
END $$;

-- Step 4: Migrate existing data to new classification system
-- Map listing_type to property_category
UPDATE properties
SET property_category = CASE
  WHEN listing_type = 'sale' THEN 'buy'
  WHEN listing_type = 'rent' THEN 'rent'
  ELSE 'buy'
END
WHERE property_category = 'buy';

-- Map existing property_type to property_general_type and property_style
UPDATE properties
SET
  property_general_type = CASE
    -- Commercial types
    WHEN LOWER(property_type) IN ('commercial', 'office', 'warehouse', 'venue') THEN
      CASE
        WHEN property_category = 'rent' THEN 'commercial_rental'
        ELSE 'commercial'
      END
    -- Land/Agricultural types
    WHEN LOWER(property_type) IN ('land', 'agricultural', 'farm') THEN
      CASE
        WHEN property_category = 'rent' THEN 'agricultural_rental'
        ELSE 'agricultural'
      END
    -- Residential types (default)
    ELSE
      CASE
        WHEN property_category = 'rent' THEN 'residential_rental'
        ELSE 'residential'
      END
  END,
  property_style = CASE
    WHEN LOWER(property_type) IN ('apartment', 'townhouse', 'condo', 'flat') THEN 'apartment_townhouse'
    WHEN LOWER(property_type) IN ('house', 'villa', 'bungalow', 'cottage') THEN 'house'
    WHEN LOWER(property_type) IN ('land', 'plot') THEN 'land'
    WHEN LOWER(property_type) IN ('office', 'office building') THEN 'office_building'
    WHEN LOWER(property_type) = 'office space' THEN 'office_space'
    WHEN LOWER(property_type) = 'warehouse' THEN 'warehouse'
    WHEN LOWER(property_type) = 'venue' THEN 'venue'
    ELSE 'house'
  END
WHERE property_style = 'house';

-- Step 5: Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_general_type ON properties(property_general_type);
CREATE INDEX IF NOT EXISTS idx_properties_style ON properties(property_style);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_classification
ON properties(property_category, property_general_type, property_style);

-- Index for filtering by category and status (common query)
CREATE INDEX IF NOT EXISTS idx_properties_category_status
ON properties(property_category, status)
WHERE status = 'active';

-- Step 6: Add constraints to ensure data integrity
DO $$
BEGIN
  -- Check constraint for valid property categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_property_category'
  ) THEN
    ALTER TABLE properties
    ADD CONSTRAINT check_property_category
    CHECK (property_category IN ('buy', 'rent'));
  END IF;

  -- Check constraint for valid property general types
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_property_general_type'
  ) THEN
    ALTER TABLE properties
    ADD CONSTRAINT check_property_general_type
    CHECK (property_general_type IN (
      'agricultural', 'commercial', 'residential',
      'agricultural_rental', 'commercial_rental', 'residential_rental'
    ));
  END IF;

  -- Check constraint for valid property styles
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_property_style'
  ) THEN
    ALTER TABLE properties
    ADD CONSTRAINT check_property_style
    CHECK (property_style IN (
      'apartment_townhouse', 'house', 'land',
      'office_building', 'office_space', 'venue', 'warehouse'
    ));
  END IF;
END $$;

-- Step 7: Create a helper function to validate property classification combinations
CREATE OR REPLACE FUNCTION validate_property_classification()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that rental categories use rental types
  IF NEW.property_category = 'rent' THEN
    IF NEW.property_general_type NOT IN ('agricultural_rental', 'commercial_rental', 'residential_rental') THEN
      RAISE EXCEPTION 'Rental properties must use rental general types';
    END IF;
  END IF;

  -- Validate that buy categories use non-rental types
  IF NEW.property_category = 'buy' THEN
    IF NEW.property_general_type IN ('agricultural_rental', 'commercial_rental', 'residential_rental') THEN
      RAISE EXCEPTION 'Buy properties cannot use rental general types';
    END IF;
  END IF;

  -- Validate commercial styles only for commercial types
  IF NEW.property_style IN ('office_building', 'office_space', 'warehouse', 'venue') THEN
    IF NEW.property_general_type NOT IN ('commercial', 'commercial_rental') THEN
      RAISE EXCEPTION 'Commercial property styles require commercial general type';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate property classifications on insert/update
DROP TRIGGER IF EXISTS trigger_validate_property_classification ON properties;
CREATE TRIGGER trigger_validate_property_classification
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION validate_property_classification();

-- Step 8: Add comment explaining the classification system
COMMENT ON COLUMN properties.property_category IS 'Main category: buy or rent';
COMMENT ON COLUMN properties.property_general_type IS 'General type: agricultural, commercial, residential (with _rental suffix for rent category)';
COMMENT ON COLUMN properties.property_style IS 'Specific style: apartment_townhouse, house, land, office_building, office_space, venue, warehouse';
