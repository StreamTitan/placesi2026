/*
  # Add Listing Type to Properties

  1. Changes
    - Add `listing_type` column to properties table
    - Set default value to 'sale'
    - Add enum type for listing_type (sale, rent)
    - Update existing properties to have 'sale' as listing_type

  2. Notes
    - This allows properties to be categorized as either for sale or for rent
    - Default is 'sale' to maintain backward compatibility
*/

-- Create listing_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('sale', 'rent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add listing_type column to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE properties ADD COLUMN listing_type listing_type DEFAULT 'sale' NOT NULL;
  END IF;
END $$;

-- Create index for filtering by listing_type
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);