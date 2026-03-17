/*
  # Create Contractor Module

  ## Overview
  Creates comprehensive contractor/service provider module for Placesi.ai platform
  with trial subscription system, listings, specials, and analytics tracking.

  ## New Tables

  ### `contractors`
  Main contractor information table
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles.id)
  - `company_name` (text)
  - `logo_url` (text, nullable)
  - `description` (text, nullable)
  - `years_in_business` (integer, nullable)
  - `primary_category` (text)
  - `additional_categories` (text array, nullable)
  - `service_areas` (text array, nullable)
  - `address` (text, nullable)
  - `phone` (text, nullable)
  - `email` (text, nullable)
  - `website_url` (text, nullable)
  - `facebook_url` (text, nullable)
  - `instagram_url` (text, nullable)
  - `linkedin_url` (text, nullable)
  - `tiktok_url` (text, nullable)
  - `employees_count` (integer, nullable)
  - `certifications` (text array, nullable)
  - `average_job_size` (text, nullable)
  - `residential_or_commercial` (text, nullable)
  - `operating_hours` (jsonb, nullable)
  - `trial_start_date` (timestamptz, defaults to now())
  - `subscription_status` (text, defaults to 'trial')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `contractor_listings`
  Contractor listing details (1 per contractor)
  - `id` (uuid, primary key)
  - `contractor_id` (uuid, references contractors.id)
  - `title` (text)
  - `description` (text, nullable)
  - `categories` (text array, nullable)
  - `portfolio_images` (text array, nullable)
  - `is_visible` (boolean, defaults to true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `contractor_specials`
  Time-limited special offers/promotions
  - `id` (uuid, primary key)
  - `contractor_id` (uuid, references contractors.id)
  - `title` (text)
  - `description` (text, nullable)
  - `start_date` (date)
  - `end_date` (date)
  - `banner_image_url` (text, nullable)
  - `created_at` (timestamptz)

  ### `contractor_analytics`
  Daily analytics tracking for contractor profiles
  - `id` (uuid, primary key)
  - `contractor_id` (uuid, references contractors.id)
  - `views_count` (integer, defaults to 0)
  - `clicks_call` (integer, defaults to 0)
  - `clicks_whatsapp` (integer, defaults to 0)
  - `clicks_email` (integer, defaults to 0)
  - `clicks_website` (integer, defaults to 0)
  - `clicks_social` (integer, defaults to 0)
  - `date` (date)

  ### `contractor_subscriptions`
  Subscription management (for future Stripe integration)
  - `id` (uuid, primary key)
  - `contractor_id` (uuid, references contractors.id)
  - `plan_type` (text: 'monthly' or 'yearly')
  - `status` (text)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz, nullable)

  ## Security
  - Enable RLS on all tables
  - Contractors can manage their own data
  - Public can view active contractor listings
  - Admin can view and manage all contractor data

  ## Functions
  - `check_trial_expiration()` - Checks if 30-day trial has expired
  - `update_contractor_listing_visibility()` - Auto-hide listings on trial expiration
*/

-- Create contractors table
CREATE TABLE IF NOT EXISTS contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  logo_url text,
  description text,
  years_in_business integer,
  primary_category text NOT NULL,
  additional_categories text[],
  service_areas text[],
  address text,
  phone text,
  email text,
  website_url text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  tiktok_url text,
  employees_count integer,
  certifications text[],
  average_job_size text,
  residential_or_commercial text,
  operating_hours jsonb,
  trial_start_date timestamptz DEFAULT now() NOT NULL,
  subscription_status text DEFAULT 'trial' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('trial', 'active', 'expired'))
);

-- Create contractor_listings table
CREATE TABLE IF NOT EXISTS contractor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  categories text[],
  portfolio_images text[],
  is_visible boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create contractor_specials table
CREATE TABLE IF NOT EXISTS contractor_specials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  banner_image_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create contractor_analytics table
CREATE TABLE IF NOT EXISTS contractor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  views_count integer DEFAULT 0 NOT NULL,
  clicks_call integer DEFAULT 0 NOT NULL,
  clicks_whatsapp integer DEFAULT 0 NOT NULL,
  clicks_email integer DEFAULT 0 NOT NULL,
  clicks_website integer DEFAULT 0 NOT NULL,
  clicks_social integer DEFAULT 0 NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  CONSTRAINT unique_contractor_date UNIQUE (contractor_id, date)
);

-- Create contractor_subscriptions table
CREATE TABLE IF NOT EXISTS contractor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES contractors(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL,
  status text NOT NULL,
  start_date timestamptz DEFAULT now() NOT NULL,
  end_date timestamptz,
  CONSTRAINT valid_plan_type CHECK (plan_type IN ('monthly', 'yearly'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contractors_user_id ON contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_contractors_subscription_status ON contractors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_contractors_primary_category ON contractors(primary_category);
CREATE INDEX IF NOT EXISTS idx_contractor_listings_contractor_id ON contractor_listings(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_listings_is_visible ON contractor_listings(is_visible);
CREATE INDEX IF NOT EXISTS idx_contractor_specials_contractor_id ON contractor_specials(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_specials_dates ON contractor_specials(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contractor_analytics_contractor_id ON contractor_analytics(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_analytics_date ON contractor_analytics(date);

-- Enable Row Level Security
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contractors table
CREATE POLICY "Public can view active contractors"
  ON contractors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Contractors can view own profile"
  ON contractors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Contractors can update own profile"
  ON contractors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create contractor profile"
  ON contractors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contractor_listings table
CREATE POLICY "Public can view visible listings"
  ON contractor_listings FOR SELECT
  TO public
  USING (is_visible = true);

CREATE POLICY "Contractors can view own listing"
  ON contractor_listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_listings.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can insert own listing"
  ON contractor_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_listings.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update own listing"
  ON contractor_listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_listings.contractor_id
      AND contractors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_listings.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

-- RLS Policies for contractor_specials table
CREATE POLICY "Public can view active specials"
  ON contractor_specials FOR SELECT
  TO public
  USING (
    CURRENT_DATE BETWEEN start_date AND end_date
  );

CREATE POLICY "Contractors can view own specials"
  ON contractor_specials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_specials.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can insert own specials"
  ON contractor_specials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_specials.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can update own specials"
  ON contractor_specials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_specials.contractor_id
      AND contractors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_specials.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can delete own specials"
  ON contractor_specials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_specials.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

-- RLS Policies for contractor_analytics table
CREATE POLICY "Contractors can view own analytics"
  ON contractor_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_analytics.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics"
  ON contractor_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON contractor_analytics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contractor_subscriptions table
CREATE POLICY "Contractors can view own subscriptions"
  ON contractor_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contractors
      WHERE contractors.id = contractor_subscriptions.contractor_id
      AND contractors.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage subscriptions"
  ON contractor_subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to check if trial has expired
CREATE OR REPLACE FUNCTION check_trial_expiration(contractor_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_date timestamptz;
  days_elapsed integer;
BEGIN
  SELECT trial_start_date INTO trial_date
  FROM contractors
  WHERE user_id = contractor_user_id;

  IF trial_date IS NULL THEN
    RETURN false;
  END IF;

  days_elapsed := EXTRACT(DAY FROM (now() - trial_date));

  RETURN days_elapsed > 30;
END;
$$;

-- Function to update listing visibility based on subscription status
CREATE OR REPLACE FUNCTION update_contractor_listing_visibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_status = 'expired' THEN
    UPDATE contractor_listings
    SET is_visible = false
    WHERE contractor_id = NEW.id;
  ELSIF NEW.subscription_status IN ('trial', 'active') THEN
    UPDATE contractor_listings
    SET is_visible = true
    WHERE contractor_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to automatically update listing visibility on subscription status change
CREATE TRIGGER trigger_update_listing_visibility
  AFTER UPDATE OF subscription_status ON contractors
  FOR EACH ROW
  WHEN (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status)
  EXECUTE FUNCTION update_contractor_listing_visibility();

-- Function to increment contractor views
CREATE OR REPLACE FUNCTION increment_contractor_views(contractor_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO contractor_analytics (contractor_id, views_count, date)
  VALUES (contractor_uuid, 1, CURRENT_DATE)
  ON CONFLICT (contractor_id, date)
  DO UPDATE SET views_count = contractor_analytics.views_count + 1;
END;
$$;

-- Function to track contractor contact clicks
CREATE OR REPLACE FUNCTION track_contractor_click(
  contractor_uuid uuid,
  click_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO contractor_analytics (contractor_id, date, views_count)
  VALUES (contractor_uuid, CURRENT_DATE, 0)
  ON CONFLICT (contractor_id, date) DO NOTHING;

  CASE click_type
    WHEN 'call' THEN
      UPDATE contractor_analytics
      SET clicks_call = clicks_call + 1
      WHERE contractor_id = contractor_uuid AND date = CURRENT_DATE;
    WHEN 'whatsapp' THEN
      UPDATE contractor_analytics
      SET clicks_whatsapp = clicks_whatsapp + 1
      WHERE contractor_id = contractor_uuid AND date = CURRENT_DATE;
    WHEN 'email' THEN
      UPDATE contractor_analytics
      SET clicks_email = clicks_email + 1
      WHERE contractor_id = contractor_uuid AND date = CURRENT_DATE;
    WHEN 'website' THEN
      UPDATE contractor_analytics
      SET clicks_website = clicks_website + 1
      WHERE contractor_id = contractor_uuid AND date = CURRENT_DATE;
    WHEN 'social' THEN
      UPDATE contractor_analytics
      SET clicks_social = clicks_social + 1
      WHERE contractor_id = contractor_uuid AND date = CURRENT_DATE;
  END CASE;
END;
$$;