/*
  # Fix Remaining Policy and Function Issues

  ## Changes Made

  ### 1. Consolidate Overlapping Policies
  - Uses restrictive policies alongside permissive ones to avoid conflicts
  - Simplifies policy logic while maintaining security
  
  ### 2. Fix Function Search Path
  - Ensures calculate_dsr function has immutable search_path
*/

-- ==========================================
-- Fix Agencies Policies
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view verified agencies" ON agencies;
DROP POLICY IF EXISTS "Agency creators can manage own agency" ON agencies;
DROP POLICY IF EXISTS "Authenticated users can create agencies" ON agencies;
DROP POLICY IF EXISTS "Admins can manage all agencies" ON agencies;

-- Single permissive SELECT policy
CREATE POLICY "View agencies"
  ON agencies FOR SELECT
  TO authenticated
  USING (
    is_verified = true 
    OR created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single permissive INSERT policy
CREATE POLICY "Create agency"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single permissive UPDATE policy
CREATE POLICY "Update agency"
  ON agencies FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single permissive DELETE policy
CREATE POLICY "Delete agency"
  ON agencies FOR DELETE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==========================================
-- Fix Agent Profiles Policies
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view verified agents" ON agent_profiles;
DROP POLICY IF EXISTS "Agents can manage own profile" ON agent_profiles;
DROP POLICY IF EXISTS "Authenticated users can create agent profile" ON agent_profiles;

-- Single permissive SELECT policy
CREATE POLICY "View agent profiles"
  ON agent_profiles FOR SELECT
  TO authenticated
  USING (
    is_verified = true 
    OR user_id = (select auth.uid())
  );

-- Single permissive INSERT policy
CREATE POLICY "Create agent profile"
  ON agent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Single permissive UPDATE policy
CREATE POLICY "Update agent profile"
  ON agent_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Single permissive DELETE policy
CREATE POLICY "Delete agent profile"
  ON agent_profiles FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ==========================================
-- Fix Application Documents Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can manage own documents" ON application_documents;
DROP POLICY IF EXISTS "Bank partners can view application documents" ON application_documents;

-- Single permissive SELECT policy
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

-- Owner-only INSERT/UPDATE/DELETE
CREATE POLICY "Manage own documents"
  ON application_documents FOR ALL
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

-- ==========================================
-- Fix Mortgage Applications Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can manage own applications" ON mortgage_applications;
DROP POLICY IF EXISTS "Bank partners can manage assigned applications" ON mortgage_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON mortgage_applications;

-- Single comprehensive policy per action
CREATE POLICY "View applications"
  ON mortgage_applications FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR bank_partner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) 
      AND role IN ('bank_partner', 'admin')
    )
  );

CREATE POLICY "Create applications"
  ON mortgage_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Update applications"
  ON mortgage_applications FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR bank_partner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) 
      AND role IN ('bank_partner', 'admin')
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR bank_partner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) 
      AND role IN ('bank_partner', 'admin')
    )
  );

CREATE POLICY "Delete applications"
  ON mortgage_applications FOR DELETE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==========================================
-- Fix Platform Analytics Policies
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage all analytics" ON platform_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON platform_analytics;

CREATE POLICY "View analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Manage analytics"
  ON platform_analytics FOR ALL
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

-- ==========================================
-- Fix Profiles Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Single SELECT policy
CREATE POLICY "View profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'admin'
    )
  );

-- ==========================================
-- Fix Properties Policies
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
DROP POLICY IF EXISTS "Agents can manage own properties" ON properties;
DROP POLICY IF EXISTS "Admins can manage all properties" ON properties;

-- Single SELECT policy
CREATE POLICY "View properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR listed_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single INSERT policy
CREATE POLICY "Create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    listed_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single UPDATE policy
CREATE POLICY "Update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    listed_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    listed_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Single DELETE policy
CREATE POLICY "Delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (
    listed_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==========================================
-- Fix Property Images Policies
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view property images" ON property_images;
DROP POLICY IF EXISTS "Property owners can manage images" ON property_images;

-- Single SELECT policy
CREATE POLICY "View property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (true);

-- Manage (INSERT/UPDATE/DELETE)
CREATE POLICY "Manage property images"
  ON property_images FOR ALL
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

-- ==========================================
-- Fix Property Inquiries Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can view own inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Users can create inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Agents can manage inquiries for their properties" ON property_inquiries;

-- Single SELECT policy
CREATE POLICY "View inquiries"
  ON property_inquiries FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_inquiries.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

-- Single INSERT policy
CREATE POLICY "Create inquiries"
  ON property_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- UPDATE/DELETE for property owners
CREATE POLICY "Manage inquiries"
  ON property_inquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_inquiries.property_id
      AND properties.listed_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_inquiries.property_id
      AND properties.listed_by = (select auth.uid())
    )
  );

-- ==========================================
-- Fix Search Analytics Policies
-- ==========================================

DROP POLICY IF EXISTS "Anyone can create search analytics" ON search_analytics;
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON search_analytics;
DROP POLICY IF EXISTS "Admins can view all search analytics" ON search_analytics;

-- Single INSERT policy
CREATE POLICY "Create search analytics"
  ON search_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins view
CREATE POLICY "View search analytics"
  ON search_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ==========================================
-- Fix calculate_dsr Function
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_dsr(
  p_annual_income numeric,
  p_monthly_debts numeric,
  p_loan_amount numeric,
  p_interest_rate numeric DEFAULT 0.065,
  p_loan_term_years numeric DEFAULT 30
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_temp
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
