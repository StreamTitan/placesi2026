/*
  # Fix Function Search Path for validate_property_classification

  ## Overview
  Fix the search_path for the validate_property_classification function to prevent
  security vulnerabilities. A mutable search_path can lead to privilege escalation
  or unexpected behavior if schemas are manipulated.

  ## Changes
  1. Drop the trigger first, then the function
  2. Recreate the validate_property_classification function with SECURITY DEFINER
  3. Set explicit search_path to 'public' to prevent search_path manipulation attacks
  4. Recreate the trigger

  ## Security Impact
  - Prevents potential privilege escalation attacks
  - Ensures function always operates in the expected schema context
  - Follows PostgreSQL security best practices
*/

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_validate_property_classification ON properties;

-- Drop existing function
DROP FUNCTION IF EXISTS validate_property_classification();

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION validate_property_classification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that property_category, property_general_type, and property_style are compatible
  
  -- For 'buy' category
  IF NEW.property_category = 'buy' THEN
    IF NEW.property_general_type NOT IN ('residential', 'commercial', 'agricultural') THEN
      RAISE EXCEPTION 'Invalid property_general_type for buy category';
    END IF;
  END IF;
  
  -- For 'rent' category
  IF NEW.property_category = 'rent' THEN
    IF NEW.property_general_type NOT IN ('residential_rental', 'commercial_rental', 'agricultural_rental') THEN
      RAISE EXCEPTION 'Invalid property_general_type for rent category';
    END IF;
  END IF;
  
  -- Validate property_style matches property_general_type
  IF NEW.property_general_type IN ('residential', 'residential_rental') THEN
    IF NEW.property_style NOT IN ('house', 'apartment_townhouse', 'land') THEN
      RAISE EXCEPTION 'Invalid property_style for residential type';
    END IF;
  END IF;
  
  IF NEW.property_general_type IN ('commercial', 'commercial_rental') THEN
    IF NEW.property_style NOT IN ('office_building', 'office_space', 'warehouse', 'venue') THEN
      RAISE EXCEPTION 'Invalid property_style for commercial type';
    END IF;
  END IF;
  
  IF NEW.property_general_type IN ('agricultural', 'agricultural_rental') THEN
    IF NEW.property_style != 'land' THEN
      RAISE EXCEPTION 'Invalid property_style for agricultural type';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_validate_property_classification
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION validate_property_classification();
