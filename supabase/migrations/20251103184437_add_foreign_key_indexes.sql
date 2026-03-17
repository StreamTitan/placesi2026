/*
  # Add Indexes for Foreign Keys

  ## Overview
  Create indexes for all foreign key columns to optimize query performance.
  Foreign keys without indexes can cause significant performance degradation
  when querying related data or enforcing referential integrity.

  ## Changes
  Add indexes for the following foreign key columns:

  ### Agencies Table
  - `created_by` - Index for queries filtering by creator
  - `verified_by` - Index for queries filtering by verifier

  ### Agent Profiles Table
  - `agency_id` - Index for queries finding agents by agency
  - `verified_by` - Index for queries filtering by verifier

  ### Application Documents Table
  - `application_id` - Index for queries finding documents by application

  ### Chat Conversations Table
  - `user_id` - Index for queries finding conversations by user

  ### Favorites Table
  - `property_id` - Index for queries finding users who favorited a property

  ### Mortgage Applications Table
  - `bank_partner_id` - Index for queries filtering by bank partner
  - `property_id` - Index for queries filtering by property
  - `reviewed_by` - Index for queries filtering by reviewer
  - `user_id` - Already indexed (in base schema)

  ### Properties Table
  - `agency_id` - Index for queries finding properties by agency
  - `listed_by` - Already indexed (in base schema)

  ### Property Images Table
  - `property_id` - Index for queries finding images by property

  ### Property Inquiries Table
  - `agent_id` - Already indexed (in base schema)
  - `property_id` - Index for queries finding inquiries by property
  - `user_id` - Already indexed (in base schema)

  ### Saved Searches Table
  - `user_id` - Index for queries finding saved searches by user

  ### Search Analytics Table
  - `clicked_property_id` - Index for analytics queries
  - `user_id` - Index for analytics queries

  ## Performance Impact
  - Improved JOIN performance on related tables
  - Faster foreign key constraint validation
  - Better query optimization for filtered queries
*/

-- Agencies indexes
CREATE INDEX IF NOT EXISTS idx_agencies_created_by ON agencies(created_by);
CREATE INDEX IF NOT EXISTS idx_agencies_verified_by ON agencies(verified_by);

-- Agent profiles indexes
CREATE INDEX IF NOT EXISTS idx_agent_profiles_agency_id ON agent_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_verified_by ON agent_profiles(verified_by);

-- Application documents indexes
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);

-- Chat conversations indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Mortgage applications indexes
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_bank_partner_id ON mortgage_applications(bank_partner_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_property_id ON mortgage_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_reviewed_by ON mortgage_applications(reviewed_by);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_agency_id ON properties(agency_id);

-- Property images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

-- Property inquiries indexes
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_clicked_property_id ON search_analytics(clicked_property_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
