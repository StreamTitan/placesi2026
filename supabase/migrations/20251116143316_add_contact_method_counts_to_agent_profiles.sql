/*
  # Add Contact Method Count Tracking System

  1. Schema Changes
    - Add count columns to `agent_profiles` table for tracking individual contact methods
      - `phone_contact_count` (integer) - Number of phone contact clicks
      - `whatsapp_contact_count` (integer) - Number of WhatsApp contact clicks
      - `email_contact_count` (integer) - Number of email contact clicks
      - `total_contact_count` (integer) - Total of all contact clicks

  2. Functions
    - Create `increment_contact_count` function to atomically increment counters
    - Ensures thread-safe increments to prevent race conditions

  3. Notes
    - Default values are set to 0 for all count columns
    - Counts are independent of the contact_requests table (which logs individual events)
    - This provides fast aggregated queries without counting rows
    - Atomic increments prevent concurrent update issues
*/

-- Add contact count columns to agent_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'phone_contact_count'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN phone_contact_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'whatsapp_contact_count'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN whatsapp_contact_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'email_contact_count'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN email_contact_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'total_contact_count'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN total_contact_count integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create function to atomically increment contact counts
CREATE OR REPLACE FUNCTION increment_contact_count(
  p_agent_id uuid,
  p_contact_method text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment the specific contact method count and total count
  IF p_contact_method = 'phone' THEN
    UPDATE agent_profiles
    SET 
      phone_contact_count = phone_contact_count + 1,
      total_contact_count = total_contact_count + 1
    WHERE user_id = p_agent_id;
  ELSIF p_contact_method = 'whatsapp' THEN
    UPDATE agent_profiles
    SET 
      whatsapp_contact_count = whatsapp_contact_count + 1,
      total_contact_count = total_contact_count + 1
    WHERE user_id = p_agent_id;
  ELSIF p_contact_method = 'email' THEN
    UPDATE agent_profiles
    SET 
      email_contact_count = email_contact_count + 1,
      total_contact_count = total_contact_count + 1
    WHERE user_id = p_agent_id;
  END IF;
END;
$$;

-- Backfill existing contact counts from contact_requests table
UPDATE agent_profiles ap
SET 
  phone_contact_count = COALESCE((
    SELECT COUNT(*) 
    FROM contact_requests cr 
    WHERE cr.agent_id = ap.user_id AND cr.contact_method = 'phone'
  ), 0),
  whatsapp_contact_count = COALESCE((
    SELECT COUNT(*) 
    FROM contact_requests cr 
    WHERE cr.agent_id = ap.user_id AND cr.contact_method = 'whatsapp'
  ), 0),
  email_contact_count = COALESCE((
    SELECT COUNT(*) 
    FROM contact_requests cr 
    WHERE cr.agent_id = ap.user_id AND cr.contact_method = 'email'
  ), 0),
  total_contact_count = COALESCE((
    SELECT COUNT(*) 
    FROM contact_requests cr 
    WHERE cr.agent_id = ap.user_id
  ), 0);