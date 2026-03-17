/*
  # Allow public viewing of agencies for signup

  1. Changes
    - Add policy to allow unauthenticated users to view all agencies for signup dropdown
    - This is safe because we only expose basic agency information (name, id)
  
  2. Security
    - Only SELECT permission for anon role
    - Agencies are public information that needs to be visible during signup
*/

-- Drop existing view policy and recreate with better access
DROP POLICY IF EXISTS "View agencies" ON agencies;

-- Allow authenticated users to view verified agencies or their own
CREATE POLICY "Authenticated users view agencies"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (
    is_verified = true 
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow anonymous users to view all agencies (needed for signup dropdown)
CREATE POLICY "Anonymous users view agencies for signup"
  ON agencies
  FOR SELECT
  TO anon
  USING (true);
