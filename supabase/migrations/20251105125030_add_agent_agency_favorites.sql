/*
  # Add Agent and Agency Favorites System

  ## Summary
  Creates tables to track user favorites for agents and agencies, enabling users to save their preferred agents and agencies for easy access later.

  ## New Tables
  
  ### `agent_favorites`
  Tracks which users have favorited which agents.
  - `user_id` (uuid, foreign key to auth.users) - The user who favorited the agent
  - `agent_id` (uuid, foreign key to profiles) - The agent being favorited
  - `created_at` (timestamptz) - When the favorite was created
  - Primary key: (user_id, agent_id)
  
  ### `agency_favorites`
  Tracks which users have favorited which agencies.
  - `user_id` (uuid, foreign key to auth.users) - The user who favorited the agency
  - `agency_id` (uuid, foreign key to agencies) - The agency being favorited
  - `created_at` (timestamptz) - When the favorite was created
  - Primary key: (user_id, agency_id)

  ## Security
  - Enable RLS on both tables
  - Users can view all favorites (to see counts)
  - Users can only insert/delete their own favorites
  - Anonymous users can view favorite counts but cannot create favorites

  ## Indexes
  - Create indexes on agent_id and agency_id for efficient count queries
  - Composite primary keys already provide index on (user_id, agent_id) and (user_id, agency_id)
*/

-- Create agent_favorites table
CREATE TABLE IF NOT EXISTS agent_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, agent_id)
);

-- Create agency_favorites table
CREATE TABLE IF NOT EXISTS agency_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, agency_id)
);

-- Create indexes for efficient count queries
CREATE INDEX IF NOT EXISTS idx_agent_favorites_agent_id ON agent_favorites(agent_id);
CREATE INDEX IF NOT EXISTS idx_agency_favorites_agency_id ON agency_favorites(agency_id);

-- Enable Row Level Security
ALTER TABLE agent_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_favorites ENABLE ROW LEVEL SECURITY;

-- Agent Favorites Policies

-- Allow anyone to view all agent favorites (for counts)
CREATE POLICY "Anyone can view agent favorites"
  ON agent_favorites
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own favorites
CREATE POLICY "Users can add their own agent favorites"
  ON agent_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own favorites
CREATE POLICY "Users can remove their own agent favorites"
  ON agent_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Agency Favorites Policies

-- Allow anyone to view all agency favorites (for counts)
CREATE POLICY "Anyone can view agency favorites"
  ON agency_favorites
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own favorites
CREATE POLICY "Users can add their own agency favorites"
  ON agency_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = agency_id);

-- Allow authenticated users to delete their own favorites
CREATE POLICY "Users can remove their own agency favorites"
  ON agency_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);