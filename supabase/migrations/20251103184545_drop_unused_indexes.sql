/*
  # Drop Unused Indexes on Properties Table

  ## Overview
  Remove unused indexes that are consuming storage space and causing overhead
  during INSERT, UPDATE, and DELETE operations without providing query benefits.

  ## Indexes to Drop
  1. `idx_properties_listing_type` - Not used by queries
  2. `idx_properties_category` - Not used by queries
  3. `idx_properties_general_type` - Not used by queries
  4. `idx_properties_style` - Not used by queries
  5. `idx_properties_classification` - Not used by queries
  6. `idx_properties_category_status` - Not used by queries

  ## Performance Impact
  - Reduces storage overhead
  - Improves INSERT/UPDATE/DELETE performance
  - Eliminates index maintenance costs for unused indexes

  ## Important Notes
  - These indexes were created but not actually utilized by the query planner
  - Existing indexes on `status`, `city`, `region`, `price`, `listed_by`, and `created_at` remain
  - If query patterns change in the future, indexes can be re-added based on actual usage
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_properties_listing_type;
DROP INDEX IF EXISTS idx_properties_category;
DROP INDEX IF EXISTS idx_properties_general_type;
DROP INDEX IF EXISTS idx_properties_style;
DROP INDEX IF EXISTS idx_properties_classification;
DROP INDEX IF EXISTS idx_properties_category_status;
