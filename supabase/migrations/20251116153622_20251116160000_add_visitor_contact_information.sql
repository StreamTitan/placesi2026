/*
  # Add Visitor Contact Information to Contact Requests

  1. Schema Changes
    - Add `visitor_name` (text, nullable) - Store visitor's name even if they don't register
    - Add `visitor_phone` (text, nullable) - Store visitor's phone number from verification
    - Add `visitor_email` (text, nullable) - Store visitor's email from verification

  2. Purpose
    - Capture contact information from verified but unregistered visitors
    - Allow agents to follow up with visitors who verify but don't create accounts
    - Provide complete tracking of all contact requests, registered or not

  3. Indexes
    - Add index on visitor_email for efficient lookup and duplicate detection

  4. Security
    - RLS policies already allow anonymous users to insert
    - No additional policy changes needed
*/

-- Add visitor contact information columns to contact_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'visitor_name'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN visitor_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'visitor_phone'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN visitor_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name = 'visitor_email'
  ) THEN
    ALTER TABLE contact_requests ADD COLUMN visitor_email text;
  END IF;
END $$;

-- Create index for efficient email lookup
CREATE INDEX IF NOT EXISTS idx_contact_requests_visitor_email
  ON contact_requests(visitor_email);
