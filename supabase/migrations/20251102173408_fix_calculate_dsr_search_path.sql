/*
  # Fix calculate_dsr Function Search Path

  ## Changes Made
  
  ### 1. Remove Old Function Versions
  - Drops all existing calculate_dsr functions
  
  ### 2. Create Secure Function
  - Sets search_path to a fixed, secure value
  - Uses STABLE volatility (appropriate for calculation functions)
  - Maintains SECURITY DEFINER for proper execution
*/

-- Drop all versions of the function
DROP FUNCTION IF EXISTS calculate_dsr(numeric, numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS calculate_dsr(numeric, numeric, numeric);

-- Recreate with proper security settings
CREATE FUNCTION calculate_dsr(
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
SET search_path TO 'public'
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
