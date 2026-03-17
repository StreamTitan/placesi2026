/*
  # Fix agent_profiles license_number constraint

  1. Changes
    - Make license_number column nullable in agent_profiles table
    - Agents can add their license number after registration
  
  2. Reason
    - License number is not collected during signup
    - Should be optional and can be added later in profile settings
*/

ALTER TABLE agent_profiles 
ALTER COLUMN license_number DROP NOT NULL;
