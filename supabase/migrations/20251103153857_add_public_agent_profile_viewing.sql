/*
  # Add Public Viewing for Agent Profiles

  1. Security Changes
    - Add policy to allow public viewing of verified agent profiles
    - Add policy to allow public viewing of agent profiles when viewing agencies
    - This enables the Agencies and Agents pages to display agent information correctly

  ## Important Notes
  - Only verified agents are visible to the public
  - Maintains security by not exposing unverified or private agent data
*/

-- Drop the existing restrictive policy for viewing agent profiles
DROP POLICY IF EXISTS "View agent profiles" ON agent_profiles;

-- Allow authenticated users to view all verified agent profiles
CREATE POLICY "Authenticated users view verified agent profiles"
  ON agent_profiles
  FOR SELECT
  TO authenticated
  USING (is_verified = true OR user_id = auth.uid());

-- Allow anonymous users to view verified agent profiles (for public agency pages)
CREATE POLICY "Anonymous users view verified agent profiles"
  ON agent_profiles
  FOR SELECT
  TO anon
  USING (is_verified = true);

-- Drop the existing restrictive policy for viewing profiles
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Allow authenticated users to view agent and agency profiles
CREATE POLICY "Authenticated users view public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR role IN ('agent', 'agency')
    OR ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );

-- Allow anonymous users to view agent and agency profiles
CREATE POLICY "Anonymous users view agent and agency profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (role IN ('agent', 'agency'));