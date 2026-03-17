/*
  # Backfill Country for Properties

  1. Changes
    - Update all existing properties to have country set to 'Trinidad and Tobago'
    - Properties table already has country column with default value

  2. Migration Details
    - Ensures all existing property records have the correct default country
*/

-- Update all existing properties to have country set to Trinidad and Tobago
UPDATE properties
SET country = 'Trinidad and Tobago'
WHERE country IS NULL OR country = '' OR country = 'Trinidad & Tobago';

-- Note: Properties table already has country column from base schema with default 'Trinidad & Tobago'
-- This migration standardizes the format to 'Trinidad and Tobago'