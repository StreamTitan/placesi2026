/*
  # Add Property Features System

  1. New Tables
    - `property_features`
      - `property_id` (uuid, foreign key to properties)
      - `feature_name` (text)
      - `created_at` (timestamp)
  
  2. Changes
    - Add property_features table to track amenities and features
    - Features stored as individual rows for flexibility and querying
    
  3. Security
    - Enable RLS on property_features table
    - Add policies for authenticated users to manage features for their properties
*/

-- Create property_features table
CREATE TABLE IF NOT EXISTS property_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_property_feature UNIQUE (property_id, feature_name)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_property_features_property_id ON property_features(property_id);
CREATE INDEX IF NOT EXISTS idx_property_features_feature_name ON property_features(feature_name);

-- Enable RLS
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;

-- Allow public to view features for public properties
CREATE POLICY "Anyone can view property features"
  ON property_features
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.status = 'active'
    )
  );

-- Allow agents to insert features for their properties
CREATE POLICY "Agents can insert features for their properties"
  ON property_features
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.listed_by = auth.uid()
    )
  );

-- Allow agents to delete features from their properties
CREATE POLICY "Agents can delete features from their properties"
  ON property_features
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.listed_by = auth.uid()
    )
  );
