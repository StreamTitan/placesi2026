/*
  # Allow Public Property Viewing

  1. Changes
    - Add policy to allow anonymous users to view active properties
    - This enables property browsing without requiring login
  
  2. Security
    - Only active properties are visible to public
    - All other operations still require authentication
*/

-- Allow anonymous users to view active properties
CREATE POLICY "Public can view active properties"
  ON properties
  FOR SELECT
  TO anon
  USING (status = 'active');
