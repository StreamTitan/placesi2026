/*
  # Add About Fields to Agencies Table

  1. Changes
    - Add `about` (text) column to agencies table for comprehensive agency description
    - Add `mission` (text) column for agency mission statement
    - Add `founded_year` (integer) column for year the agency was established
    - Add `team_size` (integer) column for number of employees
    - Add `website` (text) column for agency website URL

  2. Notes
    - All new fields are nullable to allow gradual adoption
    - Existing agencies will have NULL values for these fields until updated
    - Fields support both light and dark mode display
*/

-- Add about fields to agencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'about'
  ) THEN
    ALTER TABLE agencies ADD COLUMN about text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'mission'
  ) THEN
    ALTER TABLE agencies ADD COLUMN mission text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'founded_year'
  ) THEN
    ALTER TABLE agencies ADD COLUMN founded_year integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE agencies ADD COLUMN team_size integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'website'
  ) THEN
    ALTER TABLE agencies ADD COLUMN website text;
  END IF;
END $$;