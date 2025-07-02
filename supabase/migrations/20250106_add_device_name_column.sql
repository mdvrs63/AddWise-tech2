-- Add device_name column to devices table
ALTER TABLE public.devices 
ADD COLUMN device_name text DEFAULT null;

-- Add comment to the column
COMMENT ON COLUMN public.devices.device_name IS 'Custom name given by the customer to identify their device';

-- Create index on device_name for faster searches (optional)
CREATE INDEX IF NOT EXISTS idx_devices_device_name ON public.devices(device_name);