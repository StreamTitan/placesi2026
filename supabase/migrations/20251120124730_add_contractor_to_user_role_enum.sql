/*
  # Add contractor role to user_role enum

  1. Changes
    - Adds 'contractor' as a valid value to the user_role enum type
    - This allows users to register with the contractor role
    
  2. Security
    - No changes to existing RLS policies
    - Contractor-specific policies already exist in contractor tables
*/

-- Add 'contractor' to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'contractor';
