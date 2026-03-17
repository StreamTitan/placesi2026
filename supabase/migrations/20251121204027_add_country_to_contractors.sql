/*
  # Add Country Field to Contractors

  1. Changes
    - Add `country` column to `contractors` table
    - Set default value to 'Trinidad and Tobago'
    - Update all existing contractors to have country set to 'Trinidad and Tobago'

  2. Migration Details
    - Uses IF NOT EXISTS to safely add column
    - Backfills existing data with default country
*/

-- Add country column to contractors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractors' AND column_name = 'country'
  ) THEN
    ALTER TABLE contractors ADD COLUMN country text DEFAULT 'Trinidad and Tobago' NOT NULL;
  END IF;
END $$;

-- Update all existing contractors to have country set to Trinidad and Tobago
UPDATE contractors
SET country = 'Trinidad and Tobago'
WHERE country IS NULL OR country = '';