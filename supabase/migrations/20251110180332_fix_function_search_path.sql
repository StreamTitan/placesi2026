/*
  # Fix Function Search Path Security Issue

  1. Security Improvements
    - Set search_path to empty string for `auto_set_property_classifications` function
    - Prevents role mutable search_path security vulnerability
    - All object references will use fully qualified names

  2. Functions Updated
    - `auto_set_property_classifications`: Updated to use secure search_path

  3. Notes
    - Using empty search_path ('') prevents search path manipulation attacks
    - Function already uses fully qualified table names (public.properties)
    - This is a security best practice for PostgreSQL functions
*/

-- Drop and recreate the function with secure search_path
DROP FUNCTION IF EXISTS auto_set_property_classifications() CASCADE;

CREATE OR REPLACE FUNCTION auto_set_property_classifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.category = 'residential' THEN
    IF NEW.general_type IN ('house', 'villa', 'townhouse', 'bungalow') THEN
      NEW.classification := 'house';
    ELSIF NEW.general_type IN ('apartment', 'condo', 'penthouse', 'studio', 'loft') THEN
      NEW.classification := 'apartment';
    ELSE
      NEW.classification := 'house';
    END IF;
  ELSIF NEW.category = 'commercial' THEN
    NEW.classification := 'commercial';
  ELSIF NEW.category = 'land' THEN
    NEW.classification := 'land';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS set_property_classifications ON properties;
CREATE TRIGGER set_property_classifications
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_property_classifications();
