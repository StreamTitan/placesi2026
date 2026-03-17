/*
  # Fix Security and Performance Issues

  1. Add Missing Foreign Key Indexes
    - Add indexes for unindexed foreign keys to improve query performance
    - Tables: agencies, agent_profiles, application_documents, contact_requests, properties

  2. Optimize RLS Policies
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Affects multiple tables: profiles, area_information, area_amenities, location_insights,
      mortgage_calculation_parameters, parameter_change_history, co_applicants, application_notes,
      mortgage_applications, user_notifications, document_verification, contact_requests

  3. Remove Unused Indexes
    - Drop indexes that are not being used to reduce storage and maintenance overhead

  4. Fix Multiple Permissive Policies
    - Consolidate multiple SELECT/UPDATE policies into single policies with OR conditions

  5. Fix user_contacts View
    - Remove SECURITY DEFINER and update to use proper RLS

  6. Fix Function Search Path
    - Set immutable search_path for notify_application_status_change function

  7. Security Notes
    - All changes maintain or improve security posture
    - Performance improvements through auth function optimization
    - Reduced index maintenance overhead
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- agencies.verified_by
CREATE INDEX IF NOT EXISTS idx_agencies_verified_by
  ON agencies(verified_by);

-- agent_profiles.verified_by
CREATE INDEX IF NOT EXISTS idx_agent_profiles_verified_by
  ON agent_profiles(verified_by);

-- application_documents.application_id
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id
  ON application_documents(application_id);

-- contact_requests.visitor_id
CREATE INDEX IF NOT EXISTS idx_contact_requests_visitor_id
  ON contact_requests(visitor_id);

-- properties.agency_id
CREATE INDEX IF NOT EXISTS idx_properties_agency_id
  ON properties(agency_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES (AUTH FUNCTION CALLS)
-- =====================================================

-- profiles table
DROP POLICY IF EXISTS "Authenticated users view accessible profiles" ON profiles;
CREATE POLICY "Authenticated users view accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR role IN ('agent', 'agency')
  );

-- area_information table
DROP POLICY IF EXISTS "Authenticated users can insert area information" ON area_information;
CREATE POLICY "Authenticated users can insert area information"
  ON area_information
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update area information" ON area_information;
CREATE POLICY "Authenticated users can update area information"
  ON area_information
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- area_amenities table
DROP POLICY IF EXISTS "Authenticated users can insert area amenities" ON area_amenities;
CREATE POLICY "Authenticated users can insert area amenities"
  ON area_amenities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update area amenities" ON area_amenities;
CREATE POLICY "Authenticated users can update area amenities"
  ON area_amenities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- location_insights table
DROP POLICY IF EXISTS "Authenticated users can insert location insights" ON location_insights;
CREATE POLICY "Authenticated users can insert location insights"
  ON location_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update location insights" ON location_insights;
CREATE POLICY "Authenticated users can update location insights"
  ON location_insights
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- mortgage_calculation_parameters table
DROP POLICY IF EXISTS "Institutions can create own parameters" ON mortgage_calculation_parameters;
CREATE POLICY "Institutions can create own parameters"
  ON mortgage_calculation_parameters
  FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Institutions can update own parameters" ON mortgage_calculation_parameters;
CREATE POLICY "Institutions can update own parameters"
  ON mortgage_calculation_parameters
  FOR UPDATE
  TO authenticated
  USING (
    institution_id = (select auth.uid())
  )
  WITH CHECK (
    institution_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Institutions can view own parameters" ON mortgage_calculation_parameters;
CREATE POLICY "Institutions can view own parameters"
  ON mortgage_calculation_parameters
  FOR SELECT
  TO authenticated
  USING (
    institution_id = (select auth.uid())
    OR is_default = true
  );

-- parameter_change_history table
DROP POLICY IF EXISTS "Institutions can create own parameter history" ON parameter_change_history;
CREATE POLICY "Institutions can create own parameter history"
  ON parameter_change_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    changed_by = (select auth.uid())
  );

DROP POLICY IF EXISTS "Institutions can view own parameter history" ON parameter_change_history;
CREATE POLICY "Institutions can view own parameter history"
  ON parameter_change_history
  FOR SELECT
  TO authenticated
  USING (
    changed_by = (select auth.uid())
  );

-- co_applicants table
DROP POLICY IF EXISTS "Mortgage institutions can view all co-applicants" ON co_applicants;
DROP POLICY IF EXISTS "Users can view own co-applicant info" ON co_applicants;
CREATE POLICY "Users and institutions can view co-applicants"
  ON co_applicants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = co_applicants.application_id
      AND (
        ma.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = (select auth.uid())
          AND p.role = 'mortgage_institution'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own co-applicant info" ON co_applicants;
CREATE POLICY "Users can insert own co-applicant info"
  ON co_applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = co_applicants.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  );

-- application_notes table
DROP POLICY IF EXISTS "Mortgage institutions can manage all notes" ON application_notes;
CREATE POLICY "Mortgage institutions can manage all notes"
  ON application_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'mortgage_institution'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'mortgage_institution'
    )
  );

-- mortgage_applications table
DROP POLICY IF EXISTS "Mortgage institutions can update all applications" ON mortgage_applications;
DROP POLICY IF EXISTS "Update applications" ON mortgage_applications;
CREATE POLICY "Update applications unified"
  ON mortgage_applications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'mortgage_institution'
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'mortgage_institution'
    )
  );

DROP POLICY IF EXISTS "Mortgage institutions can view all applications" ON mortgage_applications;
DROP POLICY IF EXISTS "View applications" ON mortgage_applications;
CREATE POLICY "View applications unified"
  ON mortgage_applications
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'mortgage_institution'
    )
  );

-- user_notifications table
DROP POLICY IF EXISTS "Mortgage institutions can insert notifications" ON user_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON user_notifications;
CREATE POLICY "Institutions and system can insert notifications"
  ON user_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('mortgage_institution', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
CREATE POLICY "Users can update own notifications"
  ON user_notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
  )
  WITH CHECK (
    user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications"
  ON user_notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
  );

-- document_verification table
DROP POLICY IF EXISTS "Mortgage institutions can update all document verification" ON document_verification;
DROP POLICY IF EXISTS "Users can update own document verification" ON document_verification;
CREATE POLICY "Update document verification unified"
  ON document_verification
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND (
        ma.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = (select auth.uid())
          AND p.role = 'mortgage_institution'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND (
        ma.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = (select auth.uid())
          AND p.role = 'mortgage_institution'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Mortgage institutions can view all document verification" ON document_verification;
DROP POLICY IF EXISTS "Users can view own document verification" ON document_verification;
CREATE POLICY "View document verification unified"
  ON document_verification
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND (
        ma.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = (select auth.uid())
          AND p.role = 'mortgage_institution'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own document verification" ON document_verification;
CREATE POLICY "Users can insert own document verification"
  ON document_verification
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = document_verification.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  );

-- contact_requests table
DROP POLICY IF EXISTS "Agencies can view their agents contact requests" ON contact_requests;
DROP POLICY IF EXISTS "Agents can view own contact requests" ON contact_requests;
CREATE POLICY "Agents and agencies can view contact requests"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM agent_profiles ap
      WHERE ap.user_id = contact_requests.agent_id
      AND ap.agency_id IN (
        SELECT id FROM agencies WHERE created_by = (select auth.uid())
      )
    )
  );

-- =====================================================
-- 3. REMOVE UNUSED INDEXES
-- =====================================================

-- Area information indexes
DROP INDEX IF EXISTS idx_area_information_region;
DROP INDEX IF EXISTS idx_area_information_area_name;
DROP INDEX IF EXISTS idx_area_information_region_area;

-- Area amenities indexes
DROP INDEX IF EXISTS idx_area_amenities_area_info_id;
DROP INDEX IF EXISTS idx_area_amenities_type;

-- Property inquiries indexes
DROP INDEX IF EXISTS idx_property_inquiries_agent_id;
DROP INDEX IF EXISTS idx_property_inquiries_user_id;

-- Location insights indexes
DROP INDEX IF EXISTS idx_location_insights_region;
DROP INDEX IF EXISTS idx_location_insights_area_name;
DROP INDEX IF EXISTS idx_location_insights_type;
DROP INDEX IF EXISTS idx_location_insights_keywords;

-- Properties indexes
DROP INDEX IF EXISTS idx_properties_sold_at;
DROP INDEX IF EXISTS idx_properties_rented_at;
DROP INDEX IF EXISTS idx_properties_status_sold_at;
DROP INDEX IF EXISTS idx_properties_is_negotiable;

-- Contact requests indexes
DROP INDEX IF EXISTS idx_contact_requests_listing_id;
DROP INDEX IF EXISTS idx_contact_requests_is_registered;
DROP INDEX IF EXISTS idx_contact_requests_visitor_email;
DROP INDEX IF EXISTS idx_contact_requests_created_at;

-- Parameter history indexes
DROP INDEX IF EXISTS idx_param_history_parameter;
DROP INDEX IF EXISTS idx_param_history_changed_by;
DROP INDEX IF EXISTS idx_param_history_created;

-- Mortgage applications indexes
DROP INDEX IF EXISTS idx_mortgage_applications_gds_ratio;
DROP INDEX IF EXISTS idx_mortgage_applications_tds_ratio;
DROP INDEX IF EXISTS idx_mortgage_applications_qualification_score;
DROP INDEX IF EXISTS idx_mortgage_applications_submitted_at;
DROP INDEX IF EXISTS idx_mortgage_applications_user_viewed;

-- Application notes indexes
DROP INDEX IF EXISTS idx_application_notes_author_id;

-- Mortgage calculation parameters indexes
DROP INDEX IF EXISTS idx_mortgage_calc_params_institution;
DROP INDEX IF EXISTS idx_mortgage_calc_params_active;
DROP INDEX IF EXISTS idx_mortgage_calc_params_default;

-- User notifications indexes
DROP INDEX IF EXISTS idx_user_notifications_status;
DROP INDEX IF EXISTS idx_user_notifications_created_at;

-- Document verification indexes
DROP INDEX IF EXISTS idx_document_verification_application_id;
DROP INDEX IF EXISTS idx_document_verification_upload_status;

-- =====================================================
-- 4. FIX USER_CONTACTS VIEW SECURITY
-- =====================================================

-- Drop and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS user_contacts;

-- Create view without SECURITY DEFINER
CREATE VIEW user_contacts AS
SELECT
  p.id,
  p.full_name,
  p.phone,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id;

-- Add RLS to the view
ALTER VIEW user_contacts SET (security_invoker = true);

-- Create policy for the view
-- Note: Views inherit RLS from underlying tables in PostgreSQL
-- The auth.users table is protected by Supabase's built-in security

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATH
-- =====================================================

-- Drop and recreate notify_application_status_change with stable search_path
DROP FUNCTION IF EXISTS notify_application_status_change() CASCADE;

CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title text;
  notification_message text;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification content based on new status
    CASE NEW.status
      WHEN 'approved' THEN
        notification_title := 'Application Approved';
        notification_message := 'Congratulations! Your mortgage application has been approved.';
      WHEN 'rejected' THEN
        notification_title := 'Application Status Update';
        notification_message := 'Your mortgage application status has been updated. Please check your application for details.';
      WHEN 'under_review' THEN
        notification_title := 'Application Under Review';
        notification_message := 'Your mortgage application is now under review. We will notify you of any updates.';
      WHEN 'conditional' THEN
        notification_title := 'Conditional Approval';
        notification_message := 'Your application has received conditional approval. Please check for required actions.';
      ELSE
        notification_title := 'Application Status Update';
        notification_message := 'Your mortgage application status has been updated.';
    END CASE;

    -- Insert notification
    INSERT INTO user_notifications (
      user_id,
      application_id,
      notification_type,
      title,
      message,
      status,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'status_change',
      notification_title,
      notification_message,
      'unread',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_mortgage_application_status_change ON mortgage_applications;
CREATE TRIGGER on_mortgage_application_status_change
  AFTER UPDATE ON mortgage_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify indexes were created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agencies_verified_by') THEN
    RAISE EXCEPTION 'Failed to create idx_agencies_verified_by';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agent_profiles_verified_by') THEN
    RAISE EXCEPTION 'Failed to create idx_agent_profiles_verified_by';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_application_documents_application_id') THEN
    RAISE EXCEPTION 'Failed to create idx_application_documents_application_id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contact_requests_visitor_id') THEN
    RAISE EXCEPTION 'Failed to create idx_contact_requests_visitor_id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_agency_id') THEN
    RAISE EXCEPTION 'Failed to create idx_properties_agency_id';
  END IF;
END $$;
