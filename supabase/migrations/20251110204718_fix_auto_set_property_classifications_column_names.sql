/*
  # Fix auto_set_property_classifications Function Column Names

  ## Summary
  The function `auto_set_property_classifications` was using incorrect column names
  (category, general_type, classification) instead of the actual column names
  (property_category, property_general_type). This was causing errors when inserting
  new properties.

  ## Changes
  1. Drop the existing trigger and function
  2. Remove the trigger entirely since we don't have a classification column to auto-set
  3. The property_category, property_general_type, and property_style are set by the
     application, not by a database trigger

  ## Notes
  - The validation trigger (validate_property_classification) is kept and working correctly
  - This removes the problematic auto-classification trigger that was causing insert errors
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS set_property_classifications ON properties;

-- Drop the function
DROP FUNCTION IF EXISTS auto_set_property_classifications() CASCADE;
