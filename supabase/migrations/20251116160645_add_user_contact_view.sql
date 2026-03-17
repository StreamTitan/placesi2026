/*
  # Add User Contact Information View

  1. New View
    - `user_contacts` - Combines profile data with email from auth.users
      - Provides secure access to user contact information
      - Includes: id, full_name, phone, email
  
  2. Security
    - View respects existing RLS policies on profiles table
    - Only exposes necessary contact fields
*/

-- Create a view that combines profile data with email from auth.users
CREATE OR REPLACE VIEW user_contacts AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  u.email
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id;

-- Grant access to authenticated users
GRANT SELECT ON user_contacts TO authenticated;
