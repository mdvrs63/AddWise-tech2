-- Create GPS data table for IoT device tracking
CREATE TABLE gps_data (
  id serial primary key,
  latitude double precision,
  longitude double precision,
  timestamp timestamp with time zone,
  device_code text,
  user_id integer,
  accuracy double precision,
  -- Legacy columns for backward compatibility
  long double precision,
  lat double precision,
  speed double precision,
  time timestamp with time zone,
  altitude double precision,
  voltage double precision,
  rel1 boolean,
  rel2 boolean,
  rel3 boolean,
  alert1 boolean,
  alert2 boolean,
  alert3 boolean,
  alert4 boolean
);

-- Set default values to NULL for all columns except id
ALTER TABLE gps_data
ALTER COLUMN long SET DEFAULT NULL,
ALTER COLUMN lat SET DEFAULT NULL,
ALTER COLUMN speed SET DEFAULT NULL,
ALTER COLUMN time SET DEFAULT NULL,
ALTER COLUMN altitude SET DEFAULT NULL,
ALTER COLUMN voltage SET DEFAULT NULL,
ALTER COLUMN rel1 SET DEFAULT NULL,
ALTER COLUMN rel2 SET DEFAULT NULL,
ALTER COLUMN rel3 SET DEFAULT NULL,
ALTER COLUMN alert1 SET DEFAULT NULL,
ALTER COLUMN alert2 SET DEFAULT NULL,
ALTER COLUMN alert3 SET DEFAULT NULL,
ALTER COLUMN alert4 SET DEFAULT NULL;

-- Add foreign key constraint to devices table
ALTER TABLE gps_data
ADD CONSTRAINT fk_device_code
FOREIGN KEY (device_code) REFERENCES devices(device_code);

-- Add foreign key constraint to link user_id to device owners
ALTER TABLE gps_data
ADD CONSTRAINT fk_gps_data_user_id
FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE SET NULL;

-- Add index on device_code for faster queries
CREATE INDEX IF NOT EXISTS idx_gps_data_device_code ON gps_data(device_code);

-- Add index on user_id for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_gps_data_user_id ON gps_data(user_id);

-- Add index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_gps_data_timestamp ON gps_data(timestamp);

-- Add index on legacy time column for backward compatibility
CREATE INDEX IF NOT EXISTS idx_gps_data_time ON gps_data(time);

-- Enable Row Level Security
ALTER TABLE gps_data ENABLE ROW LEVEL SECURITY;

-- Policy for IoT devices to insert data
CREATE POLICY "IoT devices can insert GPS data" ON gps_data
  FOR INSERT
  WITH CHECK (true);

-- Policy for customers to view their device data using user_id
CREATE POLICY "Customers can view their device GPS data" ON gps_data
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy for customers to view their device data (legacy support via device_code)
CREATE POLICY "Customers can view their device GPS data via device" ON gps_data
  FOR SELECT
  USING (
    device_code IN (
      SELECT device_code 
      FROM devices 
      WHERE allocated_to_customer_id = auth.uid()
    )
  );

-- Policy for admins to view all GPS data
CREATE POLICY "Admins can view all GPS data" ON gps_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM signup_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );