-- Temporarily disable RLS for GPS data to allow testing
-- This should be re-enabled with proper policies in production

-- Drop existing policies
DROP POLICY IF EXISTS "Customers can view their device GPS data" ON gps_data;
DROP POLICY IF EXISTS "Admins can view all GPS data" ON gps_data;

-- Create a temporary policy that allows all authenticated users to read GPS data
-- This is for testing purposes only
CREATE POLICY "Allow all users to view GPS data (testing)" ON gps_data
  FOR SELECT USING (true);

-- Keep the insert policy for IoT devices
-- CREATE POLICY "Allow IoT device data insertion" ON gps_data
--   FOR INSERT WITH CHECK (true);
-- (This policy already exists)