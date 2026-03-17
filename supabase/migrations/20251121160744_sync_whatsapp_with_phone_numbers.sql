/*
  # Synchronize WhatsApp Numbers with Phone Numbers

  ## Overview
  This migration ensures all agencies and agents have their WhatsApp numbers
  synchronized with their phone numbers.

  ## Changes

  1. Schema Changes
    - Add `whatsapp` column to `agencies` table

  2. Data Updates
    - Update all existing agencies: set whatsapp = phone
    - Update all existing agents: set whatsapp = phone (from profiles table)

  ## Notes
  - Handles NULL phone values appropriately
  - Existing records are updated to match their phone numbers
  - Future records should maintain this synchronization through application logic
*/

-- Add whatsapp column to agencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE agencies ADD COLUMN whatsapp text;
  END IF;
END $$;

-- Update all existing agencies to set whatsapp = phone
UPDATE agencies
SET whatsapp = phone
WHERE phone IS NOT NULL AND (whatsapp IS NULL OR whatsapp = '');

-- Update all existing agent profiles to set whatsapp = phone from profiles table
UPDATE agent_profiles
SET whatsapp = profiles.phone
FROM profiles
WHERE agent_profiles.user_id = profiles.id
  AND profiles.phone IS NOT NULL
  AND (agent_profiles.whatsapp IS NULL OR agent_profiles.whatsapp = '');