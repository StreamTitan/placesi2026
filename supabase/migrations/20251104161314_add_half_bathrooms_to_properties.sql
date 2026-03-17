/*
  # Add Half Bathrooms Support

  1. Changes
    - Add `half_bathrooms` column to `properties` table
      - Type: numeric (allows decimal values like 0.5, 1, 1.5)
      - Default: 0
      - Allows tracking partial bathrooms in property listings

  2. Notes
    - Half bathrooms typically contain a toilet and sink but no shower/bath
    - This allows agents to accurately represent properties with partial bathroom facilities
    - Display format will show as "2.5 baths" or "2 full + 1 half bath"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'half_bathrooms'
  ) THEN
    ALTER TABLE properties ADD COLUMN half_bathrooms numeric DEFAULT 0;
  END IF;
END $$;