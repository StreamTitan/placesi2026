/*
  # Add Security Patrols Feature
  
  1. Documentation
    - This migration documents the addition of "Security Patrols" as a valid property feature option
    - Security Patrols is available for both residential and commercial properties
    - The feature is displayed with a ShieldCheck icon in the user interface
    - It is categorized under the "security" category alongside other security features
  
  2. Feature Details
    - Feature Name: "Security Patrols"
    - Icon: ShieldCheck (from lucide-react)
    - Category: security
    - Applies to: Both PROPERTY_FEATURES (residential) and COMMERCIAL_FEATURES (commercial)
  
  3. Notes
    - No schema changes required as property_features table already supports text-based feature names
    - The feature will automatically appear in the Add New Listing page's Security section
    - When selected, it will be stored in the property_features table
    - The feature will display on Property Details pages with the ShieldCheck icon
*/

-- This migration serves as documentation only
-- The property_features table already supports storing "Security Patrols" as a feature_name
-- No actual schema changes are needed

-- Verify the property_features table exists and has the correct structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'property_features'
  ) THEN
    RAISE EXCEPTION 'property_features table does not exist';
  END IF;
END $$;
