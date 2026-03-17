/*
  # Add Property Transaction Tracking Fields

  1. New Columns
    - `sold_price` (numeric, nullable) - The actual price the property was sold or rented for
    - `sold_at` (timestamptz, nullable) - When the property was marked as sold
    - `rented_at` (timestamptz, nullable) - When the property was marked as rented
  
  2. Purpose
    - Track final transaction values for sold and rented properties
    - Enable calculation of conversion rates based on actual completed transactions
    - Provide data for revenue analytics and performance metrics
    - Allow comparison between asking price and final transaction price
  
  3. Business Rules
    - sold_price is required when status is changed to 'sold' (enforced in application)
    - sold_at is automatically set when property is marked as sold
    - rented_at is automatically set when property is marked as rented
    - These fields enable accurate conversion rate calculations for analytics
  
  4. Notes
    - For rental properties, sold_price represents the monthly rental amount agreed upon
    - sold_at and rented_at are mutually exclusive in practice but both tracked for flexibility
    - All fields are nullable to maintain backward compatibility with existing properties
*/

-- Add transaction tracking columns to properties table
DO $$
BEGIN
  -- Add sold_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'sold_price'
  ) THEN
    ALTER TABLE properties ADD COLUMN sold_price numeric;
  END IF;

  -- Add sold_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'sold_at'
  ) THEN
    ALTER TABLE properties ADD COLUMN sold_at timestamptz;
  END IF;

  -- Add rented_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'rented_at'
  ) THEN
    ALTER TABLE properties ADD COLUMN rented_at timestamptz;
  END IF;
END $$;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_properties_sold_at ON properties(sold_at DESC) WHERE sold_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_rented_at ON properties(rented_at DESC) WHERE rented_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_status_sold_at ON properties(status, sold_at DESC);
