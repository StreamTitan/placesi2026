/*
  # Placesi Platform - Base Database Schema

  ## Overview
  Complete database schema for the Caribbean Real Estate Intelligence Platform (Placesi)
  supporting Trinidad & Tobago launch with AI-powered property discovery, mortgage integration,
  and analytics.

  ## New Tables

  ### 1. `profiles`
  User profile extension linked to auth.users
  - `id` (uuid, FK to auth.users)
  - `role` (enum: buyer, agent, agency, bank_partner, admin)
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text)
  - `is_verified` (boolean)
  - `theme_preference` (text: light/dark)
  - `onboarding_completed` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `agencies`
  Real estate agencies and firms
  - `id` (uuid, PK)
  - `name` (text)
  - `registration_number` (text, unique)
  - `email` (text)
  - `phone` (text)
  - `address` (text)
  - `logo_url` (text)
  - `description` (text)
  - `is_verified` (boolean)
  - `verified_at` (timestamptz)
  - `verified_by` (uuid, FK to profiles)
  - `created_by` (uuid, FK to profiles)
  - `created_at` (timestamptz)

  ### 3. `agent_profiles`
  Additional information for agents
  - `user_id` (uuid, FK to profiles)
  - `agency_id` (uuid, FK to agencies, nullable)
  - `license_number` (text, unique)
  - `bio` (text)
  - `years_experience` (int)
  - `specializations` (text[])
  - `is_verified` (boolean)
  - `verified_at` (timestamptz)
  - `verified_by` (uuid, FK to profiles)

  ### 4. `properties`
  Real estate listings
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `price` (numeric)
  - `property_type` (text)
  - `bedrooms` (int)
  - `bathrooms` (numeric)
  - `size_sqft` (numeric)
  - `lot_size_sqft` (numeric, nullable)
  - `address` (text)
  - `city` (text)
  - `region` (text)
  - `country` (text, default: Trinidad & Tobago)
  - `postal_code` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `amenities` (text[])
  - `features` (text[])
  - `year_built` (int)
  - `status` (enum: active, pending, sold, expired)
  - `listed_by` (uuid, FK to profiles)
  - `agency_id` (uuid, FK to agencies, nullable)
  - `images` (jsonb)
  - `virtual_tour_url` (text)
  - `view_count` (int, default: 0)
  - `inquiry_count` (int, default: 0)
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `property_images`
  Property photo storage
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `image_url` (text)
  - `thumbnail_url` (text)
  - `caption` (text)
  - `display_order` (int)
  - `uploaded_at` (timestamptz)

  ### 6. `favorites`
  User saved/favorited properties
  - `user_id` (uuid, FK to profiles)
  - `property_id` (uuid, FK to properties)
  - `created_at` (timestamptz)
  - Primary key: (user_id, property_id)

  ### 7. `saved_searches`
  Saved search criteria for users
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `name` (text)
  - `search_criteria` (jsonb)
  - `notification_enabled` (boolean, default: false)
  - `created_at` (timestamptz)

  ### 8. `property_inquiries`
  Contact requests from buyers to agents
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `user_id` (uuid, FK to profiles)
  - `agent_id` (uuid, FK to profiles)
  - `message` (text)
  - `contact_phone` (text)
  - `contact_email` (text)
  - `status` (enum: new, contacted, closed)
  - `created_at` (timestamptz)

  ### 9. `mortgage_applications`
  Mortgage pre-approval applications
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `property_id` (uuid, FK to properties, nullable)
  - `bank_partner_id` (uuid, FK to profiles, nullable)
  - `loan_amount` (numeric)
  - `down_payment` (numeric)
  - `annual_income` (numeric)
  - `monthly_debts` (numeric)
  - `employment_status` (text)
  - `employer_name` (text)
  - `years_employed` (numeric)
  - `dsr_ratio` (numeric)
  - `credit_score` (int, nullable)
  - `status` (enum: submitted, under_review, approved, rejected, withdrawn)
  - `notes` (text)
  - `reviewed_by` (uuid, FK to profiles, nullable)
  - `reviewed_at` (timestamptz)
  - `submitted_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. `application_documents`
  Documents uploaded for mortgage applications
  - `id` (uuid, PK)
  - `application_id` (uuid, FK to mortgage_applications)
  - `document_type` (enum: proof_of_income, id_document, job_letter, bank_statement, other)
  - `file_url` (text)
  - `file_name` (text)
  - `file_size` (int)
  - `uploaded_at` (timestamptz)

  ### 11. `search_analytics`
  Track user searches for analytics
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, nullable)
  - `search_query` (text)
  - `search_filters` (jsonb)
  - `results_count` (int)
  - `clicked_property_id` (uuid, FK to properties, nullable)
  - `session_id` (text)
  - `created_at` (timestamptz)

  ### 12. `chat_conversations`
  AI chat conversation history
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles, nullable)
  - `session_id` (text)
  - `messages` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 13. `platform_analytics`
  Aggregated platform metrics
  - `id` (uuid, PK)
  - `metric_date` (date)
  - `metric_type` (text)
  - `region` (text, nullable)
  - `value` (numeric)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Policies for authenticated users based on roles
  - Restrictive access to sensitive data (mortgage applications, documents)
  - Public read access for active property listings
  - Agent/Agency can only manage their own listings
  - Bank partners can only access assigned mortgage applications

  ## Enums and Types
  - user_role: buyer, agent, agency, bank_partner, admin
  - property_status: active, pending, sold, expired
  - inquiry_status: new, contacted, closed
  - mortgage_status: submitted, under_review, approved, rejected, withdrawn
  - document_type: proof_of_income, id_document, job_letter, bank_statement, other
*/

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('buyer', 'agent', 'agency', 'bank_partner', 'admin');
CREATE TYPE property_status AS ENUM ('active', 'pending', 'sold', 'expired');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'closed');
CREATE TYPE mortgage_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE document_type AS ENUM ('proof_of_income', 'id_document', 'job_letter', 'bank_statement', 'other');

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'buyer',
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean DEFAULT false,
  theme_preference text DEFAULT 'light',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_number text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  logo_url text,
  description text,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Agent profiles table
CREATE TABLE IF NOT EXISTS agent_profiles (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES agencies(id) ON DELETE SET NULL,
  license_number text UNIQUE NOT NULL,
  bio text,
  years_experience int DEFAULT 0,
  specializations text[],
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id)
);

-- 4. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  property_type text NOT NULL,
  bedrooms int DEFAULT 0,
  bathrooms numeric DEFAULT 0,
  size_sqft numeric,
  lot_size_sqft numeric,
  address text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  country text DEFAULT 'Trinidad & Tobago',
  postal_code text,
  latitude numeric,
  longitude numeric,
  amenities text[],
  features text[],
  year_built int,
  status property_status DEFAULT 'active',
  listed_by uuid REFERENCES profiles(id) NOT NULL,
  agency_id uuid REFERENCES agencies(id),
  images jsonb,
  virtual_tour_url text,
  view_count int DEFAULT 0,
  inquiry_count int DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '90 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Property images table
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  caption text,
  display_order int DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

-- 6. Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);

-- 7. Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  search_criteria jsonb NOT NULL,
  notification_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 8. Property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  contact_phone text,
  contact_email text,
  status inquiry_status DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- 9. Mortgage applications table
CREATE TABLE IF NOT EXISTS mortgage_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  bank_partner_id uuid REFERENCES profiles(id),
  loan_amount numeric NOT NULL,
  down_payment numeric NOT NULL,
  annual_income numeric NOT NULL,
  monthly_debts numeric DEFAULT 0,
  employment_status text NOT NULL,
  employer_name text NOT NULL,
  years_employed numeric NOT NULL,
  dsr_ratio numeric,
  credit_score int,
  status mortgage_status DEFAULT 'submitted',
  notes text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Application documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES mortgage_applications(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size int,
  uploaded_at timestamptz DEFAULT now()
);

-- 11. Search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  search_query text,
  search_filters jsonb,
  results_count int DEFAULT 0,
  clicked_property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- 12. Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 13. Platform analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_type text NOT NULL,
  region text,
  value numeric NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_listed_by ON properties(listed_by);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_agent ON property_inquiries(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user ON property_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_user ON mortgage_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_status ON mortgage_applications(status);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(metric_date DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for agencies
CREATE POLICY "Anyone can view verified agencies"
  ON agencies FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Agency creators can view own agency"
  ON agencies FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Agency creators can update own agency"
  ON agencies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can create agencies"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage all agencies"
  ON agencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for agent_profiles
CREATE POLICY "Anyone can view verified agents"
  ON agent_profiles FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Agents can view own profile"
  ON agent_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Agents can update own profile"
  ON agent_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can create agent profile"
  ON agent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for properties
CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  USING (status = 'active');

CREATE POLICY "Agents can view own listings"
  ON properties FOR SELECT
  TO authenticated
  USING (listed_by = auth.uid());

CREATE POLICY "Agents can create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    listed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('agent', 'agency')
    )
  );

CREATE POLICY "Agents can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (listed_by = auth.uid())
  WITH CHECK (listed_by = auth.uid());

CREATE POLICY "Agents can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (listed_by = auth.uid());

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for property_images
CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_images.property_id AND status = 'active'
    )
  );

CREATE POLICY "Property owners can manage images"
  ON property_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_images.property_id AND listed_by = auth.uid()
    )
  );

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for saved_searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for property_inquiries
CREATE POLICY "Users can view own inquiries"
  ON property_inquiries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR agent_id = auth.uid());

CREATE POLICY "Users can create inquiries"
  ON property_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents can update inquiry status"
  ON property_inquiries FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- RLS Policies for mortgage_applications
CREATE POLICY "Users can view own applications"
  ON mortgage_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Bank partners can view assigned applications"
  ON mortgage_applications FOR SELECT
  TO authenticated
  USING (
    bank_partner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'bank_partner'
    )
  );

CREATE POLICY "Users can create applications"
  ON mortgage_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications"
  ON mortgage_applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Bank partners can update applications"
  ON mortgage_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'bank_partner'
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON mortgage_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for application_documents
CREATE POLICY "Users can view own documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE id = application_documents.application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Bank partners can view application documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      JOIN profiles p ON p.id = auth.uid()
      WHERE ma.id = application_documents.application_id
      AND p.role = 'bank_partner'
    )
  );

CREATE POLICY "Users can upload documents"
  ON application_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications
      WHERE id = application_documents.application_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for search_analytics
CREATE POLICY "Admins can view all search analytics"
  ON search_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert search analytics"
  ON search_analytics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own conversations"
  ON chat_conversations FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for platform_analytics
CREATE POLICY "Admins can view all analytics"
  ON platform_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'bank_partner')
    )
  );

CREATE POLICY "System can insert analytics"
  ON platform_analytics FOR INSERT
  WITH CHECK (true);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate DSR (Debt Service Ratio)
CREATE OR REPLACE FUNCTION calculate_dsr(
  p_annual_income numeric,
  p_monthly_debts numeric,
  p_loan_amount numeric,
  p_interest_rate numeric DEFAULT 5.5,
  p_loan_term_years int DEFAULT 30
)
RETURNS numeric AS $$
DECLARE
  monthly_income numeric;
  monthly_mortgage numeric;
  total_monthly_debt numeric;
  dsr numeric;
BEGIN
  monthly_income := p_annual_income / 12;
  
  -- Calculate monthly mortgage payment using standard mortgage formula
  monthly_mortgage := (p_loan_amount * (p_interest_rate/100/12) * POWER(1 + (p_interest_rate/100/12), p_loan_term_years * 12)) 
                      / (POWER(1 + (p_interest_rate/100/12), p_loan_term_years * 12) - 1);
  
  total_monthly_debt := p_monthly_debts + monthly_mortgage;
  
  dsr := (total_monthly_debt / monthly_income) * 100;
  
  RETURN ROUND(dsr, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update property view count
CREATE OR REPLACE FUNCTION increment_property_views(property_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET view_count = view_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update inquiry count
CREATE OR REPLACE FUNCTION increment_inquiry_count(property_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET inquiry_count = inquiry_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;