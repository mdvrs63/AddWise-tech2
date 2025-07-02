-- Temporarily disable RLS for GPS data table to allow testing
-- This should be re-enabled with proper policies in production

-- Disable RLS on gps_data table
ALTER TABLE gps_data DISABLE ROW LEVEL SECURITY;

-- Note: To re-enable RLS later, use:
-- ALTER TABLE gps_data ENABLE ROW LEVEL SECURITY;