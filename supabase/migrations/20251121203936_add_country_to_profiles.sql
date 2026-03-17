/*
  # Add Country Field to Profiles

  1. Changes
    - Add `country` column to `profiles` table
    - Set default value to 'Trinidad and Tobago'
    - Update all existing profiles to have country set to 'Trinidad and Tobago'

  2. Migration Details
    - Uses IF NOT EXISTS to safely add column
    - Backfills existing data with default country
*/

-- Add country column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text DEFAULT 'Trinidad and Tobago' NOT NULL;
  END IF;
END $$;

-- Update all existing profiles to have country set to Trinidad and Tobago
UPDATE profiles
SET country = 'Trinidad and Tobago'
WHERE country IS NULL OR country = '';