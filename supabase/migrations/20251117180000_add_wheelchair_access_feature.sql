/*
  # Add Wheelchair Access Feature

  1. Purpose
    - Document the addition of "Wheelchair Access" as a new property feature
    - This feature enhances accessibility options for property listings
    - Applies to both residential and commercial properties

  2. Changes
    - No schema changes needed - property_features table already supports text-based feature names
    - This migration documents the new feature for tracking purposes
    - The feature will be available in the application UI and AI search

  3. Feature Details
    - Feature Name: "Wheelchair Access"
    - Category: accessibility
    - Icon: Accessibility (from lucide-react)
    - Search Keywords: wheelchair access, wheelchair accessible, wheelchair friendly,
      handicap accessible, handicap access, disability access, accessible,
      ada compliant, ada accessible, mobility accessible

  4. Integration Points
    - Added to PROPERTY_FEATURES array for residential properties
    - Added to COMMERCIAL_FEATURES array for commercial properties
    - Added to AI system prompt for natural language understanding
    - Added to query parser with comprehensive keyword mapping
    - Automatically available in Add/Edit Listing pages
    - Searchable via AI chat interface

  5. Notes
    - The existing property_features table structure supports this new feature without modifications
    - Users can now add "Wheelchair Access" when creating or editing listings
    - AI assistant recognizes multiple accessibility-related search terms
    - Feature displays with appropriate accessibility icon in property details
*/

-- This migration is primarily documentation
-- The property_features table already supports text-based feature names
-- No database schema changes are required

-- Verify the property_features table exists and has the expected structure
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
