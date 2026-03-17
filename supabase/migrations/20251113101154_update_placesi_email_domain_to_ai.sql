/*
  # Update Email Domain from placesi.com to placesi.ai
  
  ## Overview
  This migration updates all agent email addresses from the old placesi.com domain
  to the new placesi.ai domain across all relevant tables in the database.
  
  ## Affected Tables and Records
  1. **agent_profiles** - 75 records with @placesi.com emails
  2. **auth.users** - 75 records with @placesi.com emails (authentication system)
  3. **agencies** - 0 records (no updates needed)
  
  ## Changes Made
  - Update agent_profiles.email: Replace @placesi.com with @placesi.ai
  - Update auth.users.email: Replace @placesi.com with @placesi.ai for authentication
  - Update auth.users.raw_user_meta_data: Update email in metadata if present
  
  ## Backup Data (for rollback if needed)
  The following SQL can be used to restore original email addresses if needed:
  
  -- ROLLBACK SCRIPT (DO NOT EXECUTE - FOR REFERENCE ONLY)
  -- To rollback, replace @placesi.ai with @placesi.com in the UPDATE statements below
  
  ## Security
  - No RLS policy changes needed
  - Email updates maintain all existing constraints
  - Transaction ensures atomic updates (all or nothing)
  
  ## Important Notes
  - This migration is idempotent - safe to run multiple times
  - Only updates emails ending in @placesi.com
  - Preserves username portion of all email addresses
  - Updates both authentication system and profile data
*/

-- Start transaction to ensure atomic updates
DO $$
DECLARE
  updated_agent_profiles_count INTEGER;
  updated_auth_users_count INTEGER;
BEGIN
  -- Update agent_profiles table
  UPDATE agent_profiles
  SET email = REPLACE(email, '@placesi.com', '@placesi.ai')
  WHERE email LIKE '%@placesi.com';
  
  GET DIAGNOSTICS updated_agent_profiles_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records in agent_profiles table', updated_agent_profiles_count;
  
  -- Update auth.users table (authentication emails)
  UPDATE auth.users
  SET 
    email = REPLACE(email, '@placesi.com', '@placesi.ai'),
    raw_user_meta_data = CASE 
      WHEN raw_user_meta_data ? 'email' THEN
        jsonb_set(
          raw_user_meta_data,
          '{email}',
          to_jsonb(REPLACE(raw_user_meta_data->>'email', '@placesi.com', '@placesi.ai'))
        )
      ELSE raw_user_meta_data
    END
  WHERE email LIKE '%@placesi.com';
  
  GET DIAGNOSTICS updated_auth_users_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records in auth.users table', updated_auth_users_count;
  
  -- Verification: Check if any placesi.com emails remain
  IF EXISTS (SELECT 1 FROM agent_profiles WHERE email LIKE '%@placesi.com') THEN
    RAISE EXCEPTION 'Migration failed: Some agent_profiles records still contain @placesi.com';
  END IF;
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email LIKE '%@placesi.com') THEN
    RAISE EXCEPTION 'Migration failed: Some auth.users records still contain @placesi.com';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total records updated: %', updated_agent_profiles_count + updated_auth_users_count;
END $$;
