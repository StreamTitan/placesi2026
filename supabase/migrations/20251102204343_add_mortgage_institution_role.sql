/*
  # Add Mortgage Institution Role

  1. Changes
    - Add 'mortgage_institution' to user_role enum (keeping 'bank_partner' for backwards compatibility)
    - Create mortgage_institutions table for financial institutions
    - Add agency_name field to profiles for agency users
    - Add institution_name field to profiles for mortgage institution users
  
  2. New Tables
    - `mortgage_institutions`
      - `id` (uuid, primary key)
      - `name` (text) - Institution name
      - `registration_number` (text) - Business registration number
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `address` (text) - Physical address
      - `logo_url` (text) - Institution logo
      - `description` (text) - About the institution
      - `is_verified` (boolean) - Verification status
      - `verified_at` (timestamptz) - When verified
      - `verified_by` (uuid) - Admin who verified
      - `created_by` (uuid) - User who created
      - `created_at` (timestamptz) - Creation timestamp
  
  3. Security
    - Enable RLS on mortgage_institutions table
    - Add policies for authenticated users to view verified institutions
    - Add policies for institution owners to manage their data
*/

-- Add mortgage_institution to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mortgage_institution';

-- Add agency_name and institution_name to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'agency_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN agency_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'institution_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN institution_name text;
  END IF;
END $$;

-- Create mortgage_institutions table
CREATE TABLE IF NOT EXISTS mortgage_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text NOT NULL UNIQUE,
  email text NOT NULL,
  phone text,
  address text,
  logo_url text,
  description text,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mortgage_institutions ENABLE ROW LEVEL SECURITY;

-- Public can view verified institutions
CREATE POLICY "Public can view verified mortgage institutions"
  ON mortgage_institutions
  FOR SELECT
  TO anon
  USING (is_verified = true);

-- Authenticated users can view verified institutions
CREATE POLICY "Authenticated users can view verified mortgage institutions"
  ON mortgage_institutions
  FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- Institution creators can view their own institutions
CREATE POLICY "Users can view own mortgage institutions"
  ON mortgage_institutions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Users can create mortgage institutions
CREATE POLICY "Authenticated users can create mortgage institutions"
  ON mortgage_institutions
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Institution owners can update their own institutions
CREATE POLICY "Users can update own mortgage institutions"
  ON mortgage_institutions
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Admins can manage all institutions
CREATE POLICY "Admins can manage all mortgage institutions"
  ON mortgage_institutions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
