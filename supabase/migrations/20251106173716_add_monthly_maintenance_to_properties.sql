/*
  # Add Monthly Maintenance Field to Properties

  1. Changes
    - Add optional `monthly_maintenance` column to properties table
    - Type: numeric (allows decimal values)
    - Nullable: true (agents can leave blank if not applicable)
    - Purpose: Track monthly maintenance costs for properties
    
  2. Notes
    - This field is optional and can be left null
    - When provided, represents the monthly maintenance cost
    - Useful for condos, apartments, and other properties with HOA or maintenance fees
    - Uses IF NOT EXISTS to prevent errors if column already exists
*/

-- Add monthly_maintenance column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'monthly_maintenance'
  ) THEN
    ALTER TABLE properties ADD COLUMN monthly_maintenance numeric(10,2);
  END IF;
END $$;

-- Add comment to describe the purpose of this field
COMMENT ON COLUMN properties.monthly_maintenance IS 'Monthly maintenance costs (e.g., HOA fees, condo fees) in TTD';
