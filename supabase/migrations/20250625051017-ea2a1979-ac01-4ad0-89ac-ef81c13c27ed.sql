
-- Add a column to track which customer has taken each device
ALTER TABLE devices ADD COLUMN allocated_to_customer_id INTEGER;
ALTER TABLE devices ADD COLUMN allocated_to_customer_name VARCHAR(255);
ALTER TABLE devices ADD COLUMN allocated_at TIMESTAMP WITH TIME ZONE;

-- Add foreign key reference to signup_users table
ALTER TABLE devices ADD CONSTRAINT fk_devices_customer 
FOREIGN KEY (allocated_to_customer_id) REFERENCES signup_users(id) ON DELETE SET NULL;
