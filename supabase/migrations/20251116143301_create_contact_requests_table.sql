/*
  # Create Contact Requests Tracking System

  1. New Tables
    - `contact_requests`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references profiles) - The agent being contacted
      - `contact_method` (text) - phone, whatsapp, or email
      - `visitor_id` (uuid, nullable, references profiles) - Optional: logged-in user who clicked
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `contact_requests` table
    - Add policy for agents to view their own contact requests
    - Add policy for agencies to view contact requests for their agents
    - Add policy for any visitor (authenticated or not) to create contact requests

  3. Indexes
    - Add index on agent_id for faster queries
    - Add index on contact_method for filtering
    - Add index on created_at for time-based queries
*/

-- Create contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_method text NOT NULL CHECK (contact_method IN ('phone', 'whatsapp', 'email')),
  visitor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (authenticated or not) can create contact requests
CREATE POLICY "Anyone can create contact requests"
  ON contact_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Agents can view their own contact requests
CREATE POLICY "Agents can view own contact requests"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = agent_id);

-- Policy: Agency owners can view contact requests for their agents
CREATE POLICY "Agencies can view their agents contact requests"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_profiles
      WHERE agent_profiles.user_id = contact_requests.agent_id
      AND agent_profiles.agency_id IN (
        SELECT id FROM agencies WHERE created_by = auth.uid()
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_agent_id ON contact_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_contact_method ON contact_requests(contact_method);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);