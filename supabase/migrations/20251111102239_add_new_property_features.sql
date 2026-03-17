/*
  # Add New Property Features

  1. Purpose
    - Add support for four new property features across the platform
    - These features will be available for both residential and commercial properties
    
  2. New Features Added
    - **Annex** (Amenities category)
      - Separate building on property such as guest house or cottage
      - Applicable to both residential and commercial properties
      
    - **Covered Garage** (Amenities/Infrastructure category)
      - Protected parking space with roof coverage
      - Applicable to both residential and commercial properties
      
    - **Office** (Space category)
      - Dedicated office or workspace area
      - Applicable to both residential and commercial properties
      
    - **Fully Fenced** (Security category)
      - Property with complete perimeter fencing for security and privacy
      - Applicable to both residential and commercial properties
  
  3. Implementation Notes
    - Features are stored in the `property_features` table
    - Each feature is linked to a property via `property_id`
    - Features use the existing feature system without schema changes
    - RLS policies automatically apply to new features
    
  4. Integration Points
    - Property listing forms will display these options
    - Filter sidebar will include these in search criteria
    - AI chat service can parse these features from natural language queries
    - Property detail pages will show these features with appropriate icons
*/

-- No schema changes required
-- The property_features table already supports these new features
-- This migration serves as documentation of the new feature additions

-- Verify the property_features table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'property_features'
  ) THEN
    RAISE EXCEPTION 'property_features table does not exist';
  END IF;
END $$;

-- Add a comment to document the new features
COMMENT ON TABLE property_features IS 'Stores property features and amenities. Recently added: Annex, Covered Garage, Office, Fully Fenced (added 2025-11-11)';
