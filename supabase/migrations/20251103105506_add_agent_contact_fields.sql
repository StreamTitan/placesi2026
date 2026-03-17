/*
  # Add Agent Contact Fields

  1. Changes
    - Add `whatsapp` column to agent_profiles table for WhatsApp contact info
    - Add `email` column to agent_profiles table for direct email contact
    - Note: `phone` already exists in the profiles table, will be referenced from there
  
  2. Security
    - No RLS changes needed as agent_profiles already has proper security
    - These fields will be visible to users viewing properties listed by the agent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN whatsapp text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN email text;
  END IF;
END $$;