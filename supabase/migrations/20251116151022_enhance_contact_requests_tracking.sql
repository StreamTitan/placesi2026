/*
  # Enhance Contact Requests Tracking System

  1. Schema Changes
    - Add `listing_id` (uuid, nullable, FK to properties) - Track which property listing generated the contact
    - Add `is_registered` (boolean) - Distinguish between registered and unregistered users
    - Add `agent_name` (text) - Store agent's name for easier filtering in agency panels

  2. Updates to Existing Data
    - Backfill `is_registered` as true for existing records with visitor_id
    - Backfill `is_registered` as false for existing records without visitor_id
    - Backfill `agent_name` from profiles table for existing records

  3. Indexes
    - Add composite index on (agent_id, created_at) for efficient agency queries
    - Add index on listing_id for property-based filtering
    - Add index on is_registered for filtering by user type

  4. Security
    - RLS policies already allow anonymous users to insert
    - Update policies to work with new fields
*/

-- Add new columns to contact_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN listing_id uuid REFERENCES properties(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'is_registered'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN is_registered boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'agent_name'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN agent_name text;
  END IF;
END $$;

-- Backfill is_registered based on visitor_id presence
UPDATE contact_requests
SET is_registered = (visitor_id IS NOT NULL)
WHERE is_registered IS NULL OR is_registered = false;

-- Backfill agent_name from profiles table
UPDATE contact_requests cr
SET agent_name = p.full_name
FROM profiles p
WHERE cr.agent_id = p.id
AND cr.agent_name IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_requests_agent_created
  ON contact_requests(agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_requests_listing_id
  ON contact_requests(listing_id);

CREATE INDEX IF NOT EXISTS idx_contact_requests_is_registered
  ON contact_requests(is_registered);
