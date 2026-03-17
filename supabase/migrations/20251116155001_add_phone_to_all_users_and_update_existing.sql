/*
  # Add Phone Number Support for All Users and Update Existing User

  ## Overview
  Ensures phone number field is available for all user types during registration and updates
  an existing user with their phone number.

  ## Changes
  
  1. Verification
    - Verify phone column exists in profiles table (should already exist from base schema)
    - Phone format: 1868 + 7 digits for Trinidad & Tobago
  
  2. Data Update
    - Update phone number for user with email usermonderoy@gmail.com
    - Set phone to 18687451669 (+1868 745 1669)
  
  ## Security
  - No RLS policy changes needed (existing policies cover phone field)
  - Update only affects one specific user record
*/

-- Verify phone column exists in profiles (it should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    RAISE EXCEPTION 'Phone column does not exist in profiles table';
  END IF;
END $$;

-- Update phone number for the specified user
-- Find the user by email in auth.users and update their profile
DO $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Get the user ID from auth.users table
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = 'usermonderoy@gmail.com';
  
  -- If user found, update their phone number
  IF user_id_var IS NOT NULL THEN
    UPDATE profiles
    SET 
      phone = '18687451669',
      updated_at = now()
    WHERE id = user_id_var;
    
    RAISE NOTICE 'Successfully updated phone number for user: usermonderoy@gmail.com';
  ELSE
    RAISE NOTICE 'User with email usermonderoy@gmail.com not found';
  END IF;
END $$;
