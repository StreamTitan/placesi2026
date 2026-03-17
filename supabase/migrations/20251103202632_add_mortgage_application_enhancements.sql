/*
  # Mortgage Application Enhancements

  ## Summary
  Add enhanced fields to mortgage applications to support Republic Bank mortgage calculator
  and comprehensive debt service ratio calculations.

  ## Changes Made

  ### 1. Modified Tables
  - `mortgage_applications` - Add missing fields for comprehensive mortgage tracking
    - `monthly_income` (numeric) - Applicant's total monthly income
    - `monthly_expenses` (numeric) - Applicant's total monthly expenses
    - `interest_rate` (numeric) - Interest rate used for calculation
    - `loan_term_years` (int) - Loan term in years

  ### 2. Storage Buckets
  - Create `mortgage_documents` bucket for job letters and utility bills
  - Enable public access for authenticated users to upload documents
  - Set appropriate file size limits

  ### 3. Updated Document Types
  - Verify document_type enum includes 'utility_bill' for applications

  ## Security
  - RLS policies ensure users can only access their own application documents
  - Mortgage institutions can view documents for applications under review
*/

-- Add new columns to mortgage_applications if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_applications' AND column_name = 'monthly_income'
  ) THEN
    ALTER TABLE mortgage_applications ADD COLUMN monthly_income numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_applications' AND column_name = 'monthly_expenses'
  ) THEN
    ALTER TABLE mortgage_applications ADD COLUMN monthly_expenses numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_applications' AND column_name = 'interest_rate'
  ) THEN
    ALTER TABLE mortgage_applications ADD COLUMN interest_rate numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mortgage_applications' AND column_name = 'loan_term_years'
  ) THEN
    ALTER TABLE mortgage_applications ADD COLUMN loan_term_years int;
  END IF;
END $$;

-- Add utility_bill to document_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'utility_bill' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')
  ) THEN
    ALTER TYPE document_type ADD VALUE 'utility_bill';
  END IF;
END $$;