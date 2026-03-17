/*
  # Replace calculate_dsr Function with Secure Version

  ## Changes Made
  
  ### 1. Remove All Existing Versions
  - Drops all calculate_dsr function variants
  
  ### 2. Create Single Secure Function
  - Fixed search_path to 'public' (immutable)
  - SECURITY DEFINER for controlled execution
  - STABLE volatility (appropriate for calculations)
*/

-- Drop ALL possible versions of the function
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS public.calculate_dsr(numeric, numeric, numeric, numeric, numeric);
    DROP FUNCTION IF EXISTS public.calculate_dsr(numeric, numeric, numeric, numeric, integer);
    DROP FUNCTION IF EXISTS public.calculate_dsr(numeric, numeric, numeric);
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if function doesn't exist
END $$;

-- Create the secure version
CREATE FUNCTION public.calculate_dsr(
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
  -- Calculate monthly income
  monthly_income := p_annual_income / 12;

  -- Calculate monthly mortgage payment using standard amortization formula
  monthly_payment := (p_loan_amount * (p_interest_rate / 12) * POWER(1 + (p_interest_rate / 12), p_loan_term_years * 12))
    / (POWER(1 + (p_interest_rate / 12), p_loan_term_years * 12) - 1);

  -- Calculate total monthly debt obligations
  total_monthly_debt := p_monthly_debts + monthly_payment;

  -- Return DSR as a percentage
  RETURN (total_monthly_debt / monthly_income) * 100;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_dsr(numeric, numeric, numeric, numeric, numeric) TO authenticated;
