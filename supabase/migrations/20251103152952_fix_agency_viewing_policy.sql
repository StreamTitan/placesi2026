/*
  # Fix Agency Viewing Policy

  1. Changes
    - Drop existing authenticated users view policy for agencies
    - Create new policy allowing all authenticated users to view all agencies
    - This enables the Agencies page to display all agencies regardless of verification status
  
  2. Security
    - Maintains RLS protection
    - Only allows viewing (SELECT) of agency data
    - Update/Delete/Insert policies remain restricted to agency owners and admins
*/

-- Drop the restrictive authenticated users view policy
DROP POLICY IF EXISTS "Authenticated users view agencies" ON agencies;

-- Create new policy allowing authenticated users to view all agencies
CREATE POLICY "Authenticated users view all agencies"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (true);
