/*
  # Fix Agency Favorites Insert Policy

  ## Summary
  Fixes critical bug in agency_favorites table where the INSERT policy was incorrectly checking 
  `auth.uid() = agency_id` instead of `auth.uid() = user_id`. This prevented users from being 
  able to favorite agencies.

  ## Changes
  1. Drop the incorrect INSERT policy for agency_favorites
  2. Recreate the policy with the correct condition: `auth.uid() = user_id`

  ## Impact
  - Users will now be able to successfully add agencies to their favorites
  - The favorite button on agency detail pages will work correctly
*/

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Users can add their own agency favorites" ON agency_favorites;

-- Recreate with correct condition
CREATE POLICY "Users can add their own agency favorites"
  ON agency_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
