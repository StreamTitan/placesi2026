/*
  # Comprehensive Mortgage Application System Enhancement

  ## Overview
  This migration enhances the mortgage application system to support detailed applicant information,
  co-applicants, comprehensive financial tracking, automated debt service ratio calculations, and
  qualification scoring for mortgage providers.

  ## 1. New Tables
  
  ### `co_applicants`
  Stores optional co-applicant information for joint mortgage applications
  - `id` (uuid, primary key)
  - `application_id` (uuid, FK to mortgage_applications)
  - `first_name` (text)
  - `last_name` (text)
  - `email` (text)
  - `phone` (text)
  - `date_of_birth` (date)
  - `employment_status` (text)
  - `employer_name` (text)
  - `occupation` (text)
  - `years_employed` (numeric)
  - `gross_annual_income` (numeric)
  - `gross_monthly_income` (numeric)
  - `other_income` (numeric)
  - `credit_card_payments` (numeric)
  - `car_loan_payments` (numeric)
  - `student_loan_payments` (numeric)
  - `other_debt_payments` (numeric)
  - `total_monthly_debts` (numeric)
  - `created_at` (timestamptz)

  ### `application_notes`
  Internal notes for mortgage providers to track application review process
  - `id` (uuid, primary key)
  - `application_id` (uuid, FK to mortgage_applications)
  - `author_id` (uuid, FK to profiles)
  - `author_name` (text)
  - `content` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Enhanced mortgage_applications table
  
  Adds comprehensive fields for:
  - Detailed applicant information (name, DOB, occupation)
  - Complete financial breakdown (income types, debt categories)
  - Loan parameters (term, interest, down payment %)
  - Calculated metrics (GDS, TDS, LTV, qualification scores)
  - Property context information

  ## 3. Status Enum Update
  
  Adds 'conditional' status to mortgage_status enum for conditional approvals

  ## 4. Security
  
  - Enable RLS on new tables
  - Grant mortgage_institution role full access to all applications
  - Users can view their own applications
  - Secure notes for mortgage provider internal use only

  ## 5. Performance
  
  - Indexes on frequently filtered fields (status, ratios, scores, dates)
  - Indexes on foreign keys for join performance
*/

-- Add 'conditional' status to mortgage_status enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'conditional' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'mortgage_status')
  ) THEN
    ALTER TYPE mortgage_status ADD VALUE 'conditional';
  END IF;
END $$;

-- Add new columns to mortgage_applications table
DO $$
BEGIN
  -- Applicant personal information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'first_name') THEN
    ALTER TABLE mortgage_applications ADD COLUMN first_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'last_name') THEN
    ALTER TABLE mortgage_applications ADD COLUMN last_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'email') THEN
    ALTER TABLE mortgage_applications ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'phone') THEN
    ALTER TABLE mortgage_applications ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'date_of_birth') THEN
    ALTER TABLE mortgage_applications ADD COLUMN date_of_birth date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'occupation') THEN
    ALTER TABLE mortgage_applications ADD COLUMN occupation text;
  END IF;
  
  -- Financial information breakdown
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'gross_annual_income') THEN
    ALTER TABLE mortgage_applications ADD COLUMN gross_annual_income numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'gross_monthly_income') THEN
    ALTER TABLE mortgage_applications ADD COLUMN gross_monthly_income numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'other_income') THEN
    ALTER TABLE mortgage_applications ADD COLUMN other_income numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'credit_card_payments') THEN
    ALTER TABLE mortgage_applications ADD COLUMN credit_card_payments numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'car_loan_payments') THEN
    ALTER TABLE mortgage_applications ADD COLUMN car_loan_payments numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'student_loan_payments') THEN
    ALTER TABLE mortgage_applications ADD COLUMN student_loan_payments numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'other_debt_payments') THEN
    ALTER TABLE mortgage_applications ADD COLUMN other_debt_payments numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'total_monthly_debts') THEN
    ALTER TABLE mortgage_applications ADD COLUMN total_monthly_debts numeric;
  END IF;
  
  -- Loan parameters
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'down_payment_percent') THEN
    ALTER TABLE mortgage_applications ADD COLUMN down_payment_percent numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'total_interest') THEN
    ALTER TABLE mortgage_applications ADD COLUMN total_interest numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'total_payable') THEN
    ALTER TABLE mortgage_applications ADD COLUMN total_payable numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'financing_option') THEN
    ALTER TABLE mortgage_applications ADD COLUMN financing_option text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'monthly_payment') THEN
    ALTER TABLE mortgage_applications ADD COLUMN monthly_payment numeric;
  END IF;
  
  -- Property context
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'property_address') THEN
    ALTER TABLE mortgage_applications ADD COLUMN property_address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'property_price') THEN
    ALTER TABLE mortgage_applications ADD COLUMN property_price numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'property_type') THEN
    ALTER TABLE mortgage_applications ADD COLUMN property_type text;
  END IF;
  
  -- Calculated metrics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'gds_ratio') THEN
    ALTER TABLE mortgage_applications ADD COLUMN gds_ratio numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'tds_ratio') THEN
    ALTER TABLE mortgage_applications ADD COLUMN tds_ratio numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'ltv_ratio') THEN
    ALTER TABLE mortgage_applications ADD COLUMN ltv_ratio numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'qualification_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN qualification_score numeric;
  END IF;
  
  -- Score breakdown
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'gds_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN gds_score numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'tds_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN tds_score numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'down_payment_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN down_payment_score numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'employment_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN employment_score numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'income_score') THEN
    ALTER TABLE mortgage_applications ADD COLUMN income_score numeric;
  END IF;
  
  -- Estimation fields for GDS calculation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'estimated_property_tax') THEN
    ALTER TABLE mortgage_applications ADD COLUMN estimated_property_tax numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'estimated_heating_costs') THEN
    ALTER TABLE mortgage_applications ADD COLUMN estimated_heating_costs numeric DEFAULT 150;
  END IF;
END $$;

-- Create co_applicants table
CREATE TABLE IF NOT EXISTS co_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES mortgage_applications(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  employment_status text,
  employer_name text,
  occupation text,
  years_employed numeric,
  gross_annual_income numeric,
  gross_monthly_income numeric,
  other_income numeric DEFAULT 0,
  credit_card_payments numeric DEFAULT 0,
  car_loan_payments numeric DEFAULT 0,
  student_loan_payments numeric DEFAULT 0,
  other_debt_payments numeric DEFAULT 0,
  total_monthly_debts numeric,
  created_at timestamptz DEFAULT now()
);

-- Create application_notes table
CREATE TABLE IF NOT EXISTS application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES mortgage_applications(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_gds_ratio ON mortgage_applications(gds_ratio);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_tds_ratio ON mortgage_applications(tds_ratio);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_qualification_score ON mortgage_applications(qualification_score);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_submitted_at ON mortgage_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_co_applicants_application_id ON co_applicants(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_author_id ON application_notes(author_id);

-- Enable RLS
ALTER TABLE co_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for co_applicants
CREATE POLICY "Users can view own co-applicant info"
  ON co_applicants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = co_applicants.application_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own co-applicant info"
  ON co_applicants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = co_applicants.application_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Mortgage institutions can view all co-applicants"
  ON co_applicants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

-- RLS Policies for application_notes
CREATE POLICY "Mortgage institutions can manage all notes"
  ON application_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

-- Update existing mortgage_applications RLS policies to include mortgage_institution role
DROP POLICY IF EXISTS "Mortgage institutions can view all applications" ON mortgage_applications;
DROP POLICY IF EXISTS "Mortgage institutions can update all applications" ON mortgage_applications;

CREATE POLICY "Mortgage institutions can view all applications"
  ON mortgage_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

CREATE POLICY "Mortgage institutions can update all applications"
  ON mortgage_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );
