/*
  # Add WhatsApp Field to Contractors

  ## Overview
  Adds a dedicated WhatsApp field to the contractors table to allow contractors
  to specify a separate WhatsApp contact number from their primary phone number.

  ## Changes
  1. New Columns
    - `whatsapp` (text, nullable) - Dedicated WhatsApp contact number

  2. Indexes
    - No new indexes needed as this is an optional contact field

  ## Notes
  - This field is optional and allows contractors to provide a different number
    for WhatsApp contact than their primary phone number
  - The application will fall back to using the phone field for WhatsApp if
    this field is not provided (backwards compatibility)
  - All existing RLS policies continue to apply without modification
*/

-- Add whatsapp column to contractors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractors' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE contractors ADD COLUMN whatsapp text;
  END IF;
END $$;