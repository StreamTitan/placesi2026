/*
  # Allow Agents to View Visitor Profiles

  1. Problem
    - Agents cannot see the names of visitors who contact them
    - Current RLS policy only allows viewing agent/agency profiles, or own profile
    - When a regular user contacts an agent, the agent cannot fetch the user's name

  2. Solution
    - Add new policy allowing agents to view profiles of users who have contacted them
    - This enables proper display of visitor names in contact request dashboards

  3. Security
    - Only allows viewing profiles of users who have made contact requests to you
    - Does not expose arbitrary user profiles
    - Maintains privacy for users who haven't contacted the agent
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users view public profiles" ON profiles;

-- Create a new policy that allows authenticated users to view:
-- 1. Their own profile
-- 2. Agent and agency profiles (public)
-- 3. Profiles of users who have contacted them (as an agent)
CREATE POLICY "Authenticated users view accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Own profile
    auth.uid() = id
    OR
    -- Agent and agency profiles are public
    role IN ('agent', 'agency')
    OR
    -- Profiles of users who have contacted you as an agent
    EXISTS (
      SELECT 1 FROM contact_requests
      WHERE contact_requests.agent_id = auth.uid()
      AND contact_requests.visitor_id = profiles.id
    )
    OR
    -- Profiles of users who have contacted agents in your agency
    EXISTS (
      SELECT 1 FROM contact_requests cr
      INNER JOIN agent_profiles ap ON cr.agent_id = ap.user_id
      INNER JOIN agencies a ON ap.agency_id = a.id
      WHERE a.created_by = auth.uid()
      AND cr.visitor_id = profiles.id
    )
  );
