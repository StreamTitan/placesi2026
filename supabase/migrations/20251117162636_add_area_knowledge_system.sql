/*
  # Area Knowledge and Amenities System

  1. New Tables
    - `area_information`
      - Stores detailed information about each area in Trinidad and Tobago
      - Includes schools, hospitals, shopping centers, transportation, safety ratings
      - Contains property market trends and lifestyle information
    
    - `area_amenities`
      - Tracks specific amenities and their locations within areas
      - Includes schools, hospitals, shopping centers, parks, etc.
      - Stores proximity data and descriptions
    
    - `location_insights`
      - Stores AI training data and insights about regions and areas
      - Contains contextual information for natural language responses
      - Includes keywords and phrases for location matching

  2. Security
    - Enable RLS on all new tables
    - Allow public read access for area information
    - Restrict write access to authenticated agents and admins

  3. Indexes
    - Add indexes on area names and regions for fast lookups
    - Add text search indexes for natural language queries
*/

-- Area Information Table
CREATE TABLE IF NOT EXISTS area_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  area_name text NOT NULL,
  description text,
  property_market_overview text,
  average_property_price_buy numeric,
  average_property_price_rent numeric,
  safety_rating numeric CHECK (safety_rating >= 0 AND safety_rating <= 5),
  family_friendly_rating numeric CHECK (family_friendly_rating >= 0 AND family_friendly_rating <= 5),
  business_friendly_rating numeric CHECK (business_friendly_rating >= 0 AND business_friendly_rating <= 5),
  lifestyle_description text,
  transportation_access text,
  notable_features text[],
  schools_overview text,
  shopping_overview text,
  medical_facilities_overview text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(region, area_name)
);

-- Area Amenities Table
CREATE TABLE IF NOT EXISTS area_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_info_id uuid REFERENCES area_information(id) ON DELETE CASCADE,
  amenity_type text NOT NULL CHECK (amenity_type IN ('school', 'hospital', 'shopping', 'park', 'transportation', 'bank', 'restaurant', 'gym', 'other')),
  name text NOT NULL,
  description text,
  address text,
  latitude numeric,
  longitude numeric,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  distance_description text,
  created_at timestamptz DEFAULT now()
);

-- Location Insights Table
CREATE TABLE IF NOT EXISTS location_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  area_name text,
  insight_type text NOT NULL CHECK (insight_type IN ('general', 'schools', 'shopping', 'medical', 'transportation', 'lifestyle', 'investment', 'family', 'business')),
  content text NOT NULL,
  keywords text[],
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE area_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for area_information
CREATE POLICY "Anyone can view area information"
  ON area_information FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert area information"
  ON area_information FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

CREATE POLICY "Authenticated users can update area information"
  ON area_information FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

-- RLS Policies for area_amenities
CREATE POLICY "Anyone can view area amenities"
  ON area_amenities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert area amenities"
  ON area_amenities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

CREATE POLICY "Authenticated users can update area amenities"
  ON area_amenities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

-- RLS Policies for location_insights
CREATE POLICY "Anyone can view location insights"
  ON location_insights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert location insights"
  ON location_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

CREATE POLICY "Authenticated users can update location insights"
  ON location_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('agent', 'agency', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_area_information_region ON area_information(region);
CREATE INDEX IF NOT EXISTS idx_area_information_area_name ON area_information(area_name);
CREATE INDEX IF NOT EXISTS idx_area_information_region_area ON area_information(region, area_name);

CREATE INDEX IF NOT EXISTS idx_area_amenities_area_info_id ON area_amenities(area_info_id);
CREATE INDEX IF NOT EXISTS idx_area_amenities_type ON area_amenities(amenity_type);

CREATE INDEX IF NOT EXISTS idx_location_insights_region ON location_insights(region);
CREATE INDEX IF NOT EXISTS idx_location_insights_area_name ON location_insights(area_name);
CREATE INDEX IF NOT EXISTS idx_location_insights_type ON location_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_location_insights_keywords ON location_insights USING GIN(keywords);