/*
  # Add Commercial Property Fields

  1. Changes
    - Add optional commercial-specific fields to properties table:
      - `parking_spaces` (integer) - Number of dedicated parking spaces
      - `loading_docks` (integer) - Number of loading docks
      - `floor_number` (integer) - Floor number for office spaces
      - `total_floors` (integer) - Total number of floors in building
      - `zoning` (text) - Zoning classification (e.g., Commercial, Industrial, Mixed-Use)
      - `half_bathrooms` (numeric) - Number of half bathrooms (already exists, ensuring it's properly set)
    
  2. Notes
    - These fields are optional and only relevant for commercial properties
    - Residential properties can ignore these fields
    - Uses IF NOT EXISTS to prevent errors if columns already exist
*/

-- Add parking_spaces column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'parking_spaces'
  ) THEN
    ALTER TABLE properties ADD COLUMN parking_spaces integer DEFAULT 0;
  END IF;
END $$;

-- Add loading_docks column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'loading_docks'
  ) THEN
    ALTER TABLE properties ADD COLUMN loading_docks integer DEFAULT 0;
  END IF;
END $$;

-- Add floor_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'floor_number'
  ) THEN
    ALTER TABLE properties ADD COLUMN floor_number integer;
  END IF;
END $$;

-- Add total_floors column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'total_floors'
  ) THEN
    ALTER TABLE properties ADD COLUMN total_floors integer;
  END IF;
END $$;

-- Add zoning column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'zoning'
  ) THEN
    ALTER TABLE properties ADD COLUMN zoning text;
  END IF;
END $$;

-- Add comment to describe the purpose of these fields
COMMENT ON COLUMN properties.parking_spaces IS 'Number of dedicated parking spaces (primarily for commercial properties)';
COMMENT ON COLUMN properties.loading_docks IS 'Number of loading docks (primarily for commercial/warehouse properties)';
COMMENT ON COLUMN properties.floor_number IS 'Floor number for office spaces within a building';
COMMENT ON COLUMN properties.total_floors IS 'Total number of floors in the building';
COMMENT ON COLUMN properties.zoning IS 'Zoning classification (e.g., Commercial, Industrial, Mixed-Use, Retail)';
