/*
  # Optimize RLS Policies with Auth Function SELECT Wrappers

  ## Overview
  Optimize Row Level Security policies by wrapping auth function calls in SELECT statements.
  This prevents the auth functions from being re-evaluated for each row, significantly
  improving query performance at scale.

  ## Changes
  Update RLS policies on the `profiles` table:
  1. "Users can update profiles" - Wrap auth.uid() in SELECT
  2. "Users can insert profiles" - Wrap auth.uid() in SELECT
  3. "Authenticated users view public profiles" - Wrap auth.uid() in SELECT

  ## Performance Impact
  - Auth functions are evaluated once per query instead of once per row
  - Dramatically improves performance for queries that scan multiple rows
  - Reduces database load and improves response times

  ## Reference
  See Supabase documentation: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users view public profiles" ON profiles;

-- Recreate policies with optimized auth function calls

-- Policy: Users can update their own profiles
CREATE POLICY "Users can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: Authenticated users can view public profiles
CREATE POLICY "Authenticated users view public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id OR
    role IN ('agent', 'agency')
  );
