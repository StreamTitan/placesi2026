/*
  # Allow Public Viewing of All Agent Profiles

  1. Security Changes
    - Update policy to allow public viewing of ALL agent profiles (not just verified)
    - Verification status will still be displayed as a trust indicator
    - This enables agents to be discoverable on the platform immediately after registration

  2. Reasoning
    - Agents should be visible on their agency pages even before verification
    - Verification badge serves as a trust indicator, not a visibility gate
    - Matches typical platform behavior (profiles visible, verification shows credibility)
*/

-- Drop existing policies for agent profiles viewing
DROP POLICY IF EXISTS "Authenticated users view verified agent profiles" ON agent_profiles;
DROP POLICY IF EXISTS "Anonymous users view verified agent profiles" ON agent_profiles;

-- Allow authenticated users to view all agent profiles
CREATE POLICY "Authenticated users can view all agent profiles"
  ON agent_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to view all agent profiles (for public pages)
CREATE POLICY "Public can view all agent profiles"
  ON agent_profiles
  FOR SELECT
  TO anon
  USING (true);
