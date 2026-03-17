/*
  # Add is_negotiable column to properties table

  1. Changes
    - Add `is_negotiable` boolean column to properties table
    - Default value is false
    - Allows agents to mark properties with flexible pricing

  2. Purpose
    - Enable agents to indicate when property prices are negotiable
    - Allow buyers/renters to filter and identify properties with flexible pricing
    - Display "Negotiable" badge on property listings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'is_negotiable'
  ) THEN
    ALTER TABLE properties ADD COLUMN is_negotiable boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add index for filtering by negotiable status
CREATE INDEX IF NOT EXISTS idx_properties_is_negotiable ON properties(is_negotiable);
