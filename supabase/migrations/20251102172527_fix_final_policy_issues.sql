/*
  # Fix Final Policy and Function Issues

  ## Changes Made

  ### 1. Fix Remaining Multiple Permissive Policies
  - Separates read-only and write policies properly
  - Ensures only one permissive policy per action type
  
  ### 2. Verify Function Security
  - Double-check calculate_dsr function configuration
*/

-- ==========================================
-- Fix Application Documents Policies
-- ==========================================

DROP POLICY IF EXISTS "View application documents" ON application_documents;
DROP POLICY IF EXISTS "Manage own documents" ON application_documents;

-- Single SELECT policy (read-only)
CREATE POLICY "View application documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = application_documents.application_id
      AND (
        ma.user_id = (select auth.uid())
        OR ma.bank_partner_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = (select auth.uid()) 
          AND role IN ('bank_partner', 'admin')
        )
      )
    )
  );

-- Separate policies for write operations (INSERT, UPDATE, DELETE)
CREATE POLICY "Insert own documents"
  ON application_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = application_documents.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Update own documents"
  ON application_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = application_documents.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = application_documents.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Delete own documents"
  ON application_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE mortgage_applications.id = application_documents.application_id
      AND mortgage_applications.user_id = (select auth.uid())
    )
  );

-- ==========================================
-- Fix Platform Analytics Policies
-- ==========================================

DROP POLICY IF EXISTS "View analytics" ON platform_analytics;
DROP POLICY IF EXISTS "Manage analytics" ON platform_analytics;

-- Single SELECT policy
CREATE POLICY "View analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Separate write policies
CREATE POLICY "Insert analytics"
  ON platform_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Update analytics"
  ON platform_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Delete analytics"
  ON platform_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==========================================
-- Fix Property Images Policies
-- ==========================================

DROP POLICY IF EXISTS "View property images" ON property_images;
DROP POLICY IF EXISTS "Manage property images" ON property_images;

-- Single SELECT policy (everyone can view)
CREATE POLICY "View property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (true);

-- Separate write policies (only owners)
CREATE POLICY "Insert property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

CREATE POLICY "Update property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.listed_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

CREATE POLICY "Delete property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

-- ==========================================
-- Verify calculate_dsr Function is Secure
-- ==========================================

-- Recreate with STABLE instead of IMMUTABLE (more appropriate for this function)
-- and ensure search_path is properly set
CREATE OR REPLACE FUNCTION calculate_dsr(
  p_annual_income numeric,
  p_monthly_debts numeric,
  p_loan_amount numeric,
  p_interest_rate numeric DEFAULT 0.065,
  p_loan_term_years numeric DEFAULT 30
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  monthly_income numeric;
  monthly_payment numeric;
  total_monthly_debt numeric;
BEGIN
  monthly_income := p_annual_income / 12;

  monthly_payment := (p_loan_amount * (p_interest_rate / 12) * POWER(1 + (p_interest_rate / 12), p_loan_term_years * 12))
    / (POWER(1 + (p_interest_rate / 12), p_loan_term_years * 12) - 1);

  total_monthly_debt := p_monthly_debts + monthly_payment;

  RETURN (total_monthly_debt / monthly_income) * 100;
END;
$$;
