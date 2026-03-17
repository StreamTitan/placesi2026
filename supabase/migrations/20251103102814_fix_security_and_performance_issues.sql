/*
  # Fix Security and Performance Issues

  ## Changes

  1. **Add Missing Indexes on Foreign Keys**
     - Add index on `mortgage_institutions.created_by`
     - Add index on `mortgage_institutions.verified_by`

  2. **Optimize RLS Policies for Auth Functions**
     - Replace `auth.uid()` with `(select auth.uid())` in all mortgage_institutions policies
     - This prevents re-evaluation for each row, improving query performance at scale

  3. **Remove Unused Indexes**
     - Drop all indexes that are not being used to reduce maintenance overhead
     - Indexes can be re-added if query patterns change in the future

  4. **Address Multiple Permissive Policies**
     - Consolidate overlapping policies into single policies where appropriate
     - Keep admin policies separate for clarity

  ## Security Notes
  - All RLS policies remain intact and secure
  - Performance optimizations do not compromise security
  - Unused indexes removed to reduce write overhead
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_mortgage_institutions_created_by 
  ON public.mortgage_institutions(created_by);

CREATE INDEX IF NOT EXISTS idx_mortgage_institutions_verified_by 
  ON public.mortgage_institutions(verified_by);

-- Drop and recreate RLS policies with optimized auth function calls
DROP POLICY IF EXISTS "Admins can manage all mortgage institutions" ON public.mortgage_institutions;
DROP POLICY IF EXISTS "Authenticated users can create mortgage institutions" ON public.mortgage_institutions;
DROP POLICY IF EXISTS "Users can update own mortgage institutions" ON public.mortgage_institutions;
DROP POLICY IF EXISTS "Users can view own mortgage institutions" ON public.mortgage_institutions;
DROP POLICY IF EXISTS "Authenticated users can view verified mortgage institutions" ON public.mortgage_institutions;

-- Consolidated SELECT policy (combines user's own + verified institutions + admin access)
CREATE POLICY "Users can view mortgage institutions"
  ON public.mortgage_institutions
  FOR SELECT
  TO authenticated
  USING (
    is_verified = true 
    OR created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Consolidated INSERT policy (combines user creation + admin access)
CREATE POLICY "Users can create mortgage institutions"
  ON public.mortgage_institutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Consolidated UPDATE policy (combines user update own + admin access)
CREATE POLICY "Users can update mortgage institutions"
  ON public.mortgage_institutions
  FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Admin-only DELETE policy
CREATE POLICY "Admins can delete mortgage institutions"
  ON public.mortgage_institutions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Remove unused indexes to reduce write overhead
DROP INDEX IF EXISTS public.idx_properties_city;
DROP INDEX IF EXISTS public.idx_properties_region;
DROP INDEX IF EXISTS public.idx_properties_price;
DROP INDEX IF EXISTS public.idx_properties_listed_by;
DROP INDEX IF EXISTS public.idx_properties_created_at;
DROP INDEX IF EXISTS public.idx_property_inquiries_agent;
DROP INDEX IF EXISTS public.idx_property_inquiries_user;
DROP INDEX IF EXISTS public.idx_mortgage_applications_user;
DROP INDEX IF EXISTS public.idx_mortgage_applications_status;
DROP INDEX IF EXISTS public.idx_search_analytics_created_at;
DROP INDEX IF EXISTS public.idx_platform_analytics_date;
DROP INDEX IF EXISTS public.idx_agencies_created_by;
DROP INDEX IF EXISTS public.idx_agencies_verified_by;
DROP INDEX IF EXISTS public.idx_agent_profiles_agency_id;
DROP INDEX IF EXISTS public.idx_agent_profiles_verified_by;
DROP INDEX IF EXISTS public.idx_application_documents_application_id;
DROP INDEX IF EXISTS public.idx_chat_conversations_user_id;
DROP INDEX IF EXISTS public.idx_chat_conversations_session_id;
DROP INDEX IF EXISTS public.idx_favorites_property_id;
DROP INDEX IF EXISTS public.idx_mortgage_applications_bank_partner_id;
DROP INDEX IF EXISTS public.idx_mortgage_applications_property_id;
DROP INDEX IF EXISTS public.idx_mortgage_applications_reviewed_by;
DROP INDEX IF EXISTS public.idx_properties_agency_id;
DROP INDEX IF EXISTS public.idx_property_images_property_id;
DROP INDEX IF EXISTS public.idx_property_inquiries_property_id;
DROP INDEX IF EXISTS public.idx_saved_searches_user_id;
DROP INDEX IF EXISTS public.idx_search_analytics_clicked_property_id;
DROP INDEX IF EXISTS public.idx_search_analytics_user_id;
