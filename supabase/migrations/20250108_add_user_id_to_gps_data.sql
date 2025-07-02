-- Add user_id column to gps_data table to link GPS data to device owners
ALTER TABLE gps_data
ADD COLUMN user_id INTEGER;

-- Add foreign key constraint to link user_id to signup_users table
ALTER TABLE gps_data
ADD CONSTRAINT fk_gps_data_user_id
FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE SET NULL;

-- Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_gps_data_user_id ON gps_data(user_id);

-- Update existing GPS data to set user_id based on device ownership
UPDATE gps_data 
SET user_id = devices.allocated_to_customer_id
FROM devices 
WHERE gps_data.device_code = devices.device_code
AND gps_data.user_id IS NULL;

-- Update RLS policies to use user_id for better performance
DROP POLICY IF EXISTS "Customers can view their device GPS data" ON gps_data;

-- Create new policy using user_id for direct access
CREATE POLICY "Customers can view their GPS data" ON gps_data
  FOR SELECT USING (
    user_id = auth.uid()::integer
  );

-- Add policy for customers to update their GPS data (for real-time tracking)
CREATE POLICY "Customers can insert their GPS data" ON gps_data
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::integer OR user_id IS NULL
  );

-- Comment explaining the user_id linkage
COMMENT ON COLUMN gps_data.user_id IS 'Links GPS data to the user who owns the device (from devices.allocated_to_customer_id)';