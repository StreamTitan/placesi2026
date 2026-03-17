/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add index on `mortgage_applications.user_id` for foreign key `mortgage_applications_user_id_fkey`
    - Add index on `properties.listed_by` for foreign key `properties_listed_by_fkey`
    - Add index on `property_inquiries.agent_id` for foreign key `property_inquiries_agent_id_fkey`
    - Add index on `property_inquiries.user_id` for foreign key `property_inquiries_user_id_fkey`

  2. Notes
    - These indexes improve query performance for joins and foreign key lookups
    - Each index corresponds to an unindexed foreign key constraint
*/

-- Add index for mortgage_applications.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_user_id 
ON mortgage_applications(user_id);

-- Add index for properties.listed_by foreign key
CREATE INDEX IF NOT EXISTS idx_properties_listed_by 
ON properties(listed_by);

-- Add index for property_inquiries.agent_id foreign key
CREATE INDEX IF NOT EXISTS idx_property_inquiries_agent_id 
ON property_inquiries(agent_id);

-- Add index for property_inquiries.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id 
ON property_inquiries(user_id);
