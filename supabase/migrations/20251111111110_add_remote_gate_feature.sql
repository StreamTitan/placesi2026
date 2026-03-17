/*
  # Add Remote Gate Feature

  1. Purpose
    - Document the addition of "Remote Gate" as a valid property feature option
    - Remote Gate is available for both residential and commercial properties
    - Provides automated or remote-controlled gate access for enhanced security and convenience

  2. Feature Details
    - **Feature Name**: "Remote Gate"
    - **Icon**: DoorOpen (from lucide-react)
    - **Category**: security
    - **Applies to**: Both residential and commercial properties
    - **Description**: Automated gate system with remote control access, providing convenient entry/exit control

  3. Implementation Notes
    - Remote Gate joins other security features like "Gated Community", "Gated Compound", and "Security Patrols"
    - The feature appears in the Security section of the Add/Edit Listing pages
    - Users can filter properties by Remote Gate in the filter sidebar
    - AI chat assistant recognizes keywords: remote gate, automatic gate, electric gate, automated gate, remote control gate

  4. Integration Points
    - Property listing forms display this option in the Security section
    - Filter sidebar includes this in the security features search criteria
    - AI chat service can parse this feature from natural language queries
    - Property detail pages show this feature with the DoorOpen icon

  5. Notes
    - No schema changes required as property_features table already supports text-based feature names
    - The feature is stored in the property_features table with feature_name = 'Remote Gate'
    - RLS policies automatically apply to this feature
    - Feature added: 2025-11-11
*/

-- This migration serves as documentation only
-- The property_features table already supports storing "Remote Gate" as a feature_name
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

-- Update the table comment to document the new feature
COMMENT ON TABLE property_features IS 'Stores property features and amenities. Recently added: Annex, Covered Garage, Office, Fully Fenced (added 2025-11-11), Remote Gate (added 2025-11-11)';
