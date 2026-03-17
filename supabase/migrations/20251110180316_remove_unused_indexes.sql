/*
  # Remove Unused Indexes

  1. Performance Improvements
    - Remove indexes that have not been used
    - Reduces storage overhead and improves insert/update performance
    - Simplifies index maintenance

  2. Indexes Removed
    - `idx_property_features_feature_name` on `property_features`
    - `idx_properties_category` on `properties`
    - `idx_properties_general_type` on `properties`
    - `idx_properties_style` on `properties`
    - `idx_properties_city_category` on `properties`
    - `idx_agencies_verified_by` on `agencies`
    - `idx_agent_profiles_verified_by` on `agent_profiles`
    - `idx_application_documents_application_id` on `application_documents`
    - `idx_properties_agency_id` on `properties`

  3. Notes
    - These indexes have not been used by any queries
    - Removing them improves write performance
    - Can be recreated if usage patterns change
*/

-- Remove unused indexes from property_features
DROP INDEX IF EXISTS idx_property_features_feature_name;

-- Remove unused indexes from properties
DROP INDEX IF EXISTS idx_properties_category;
DROP INDEX IF EXISTS idx_properties_general_type;
DROP INDEX IF EXISTS idx_properties_style;
DROP INDEX IF EXISTS idx_properties_city_category;
DROP INDEX IF EXISTS idx_properties_agency_id;

-- Remove unused indexes from agencies
DROP INDEX IF EXISTS idx_agencies_verified_by;

-- Remove unused indexes from agent_profiles
DROP INDEX IF EXISTS idx_agent_profiles_verified_by;

-- Remove unused indexes from application_documents
DROP INDEX IF EXISTS idx_application_documents_application_id;
