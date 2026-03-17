/*
  # Add Country Field to Agencies

  1. Changes
    - Add `country` column to `agencies` table
    - Set default value to 'Trinidad and Tobago'
    - Update all existing agencies to have country set to 'Trinidad and Tobago'

  2. Migration Details
    - Uses IF NOT EXISTS to safely add column
    - Backfills existing data with default country
*/

-- Add country column to agencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'country'
  ) THEN
    ALTER TABLE agencies ADD COLUMN country text DEFAULT 'Trinidad and Tobago' NOT NULL;
  END IF;
END $$;

-- Update all existing agencies to have country set to Trinidad and Tobago
UPDATE agencies
SET country = 'Trinidad and Tobago'
WHERE country IS NULL OR country = '';