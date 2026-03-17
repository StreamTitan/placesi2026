/*
  # Add About Fields to Agent Profiles Table

  1. Changes
    - Add `about` (text) column to agent_profiles table for comprehensive agent description
    - Add `mission` (text) column for agent's personal mission statement
    - Add `languages_spoken` (text array) column for languages the agent speaks
    - Add `certifications` (text array) column for professional certifications
    - Add `awards` (text array) column for awards and recognitions
    - Add `areas_served` (text array) column for geographic areas the agent serves

  2. Notes
    - All new fields are nullable to allow gradual adoption
    - Existing agent profiles will have NULL values for these fields until updated
    - Fields support both light and dark mode display
*/

-- Add about fields to agent_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'about'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN about text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'mission'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN mission text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'languages_spoken'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN languages_spoken text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN certifications text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'awards'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN awards text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_profiles' AND column_name = 'areas_served'
  ) THEN
    ALTER TABLE agent_profiles ADD COLUMN areas_served text[];
  END IF;
END $$;