/*
  # Optimize RLS Policies with Auth Function Initialization

  1. Performance Improvements
    - Replace `auth.uid()` calls with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - `property_features`: 2 policies optimized (insert, delete)
    - `agent_favorites`: 2 policies optimized (insert, delete)
    - `agency_favorites`: 2 policies optimized (insert, delete)

  3. Notes
    - The `(select auth.uid())` pattern evaluates once per query instead of per row
    - This is the recommended best practice from Supabase documentation
*/

-- Drop and recreate property_features policies with optimized auth calls
DROP POLICY IF EXISTS "Agents can insert features for their properties" ON property_features;
DROP POLICY IF EXISTS "Agents can delete features from their properties" ON property_features;

CREATE POLICY "Agents can insert features for their properties"
  ON property_features
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

CREATE POLICY "Agents can delete features from their properties"
  ON property_features
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

-- Drop and recreate agent_favorites policies with optimized auth calls
DROP POLICY IF EXISTS "Users can add their own agent favorites" ON agent_favorites;
DROP POLICY IF EXISTS "Users can remove their own agent favorites" ON agent_favorites;

CREATE POLICY "Users can add their own agent favorites"
  ON agent_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove their own agent favorites"
  ON agent_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate agency_favorites policies with optimized auth calls
DROP POLICY IF EXISTS "Users can add their own agency favorites" ON agency_favorites;
DROP POLICY IF EXISTS "Users can remove their own agency favorites" ON agency_favorites;

CREATE POLICY "Users can add their own agency favorites"
  ON agency_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove their own agency favorites"
  ON agency_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
