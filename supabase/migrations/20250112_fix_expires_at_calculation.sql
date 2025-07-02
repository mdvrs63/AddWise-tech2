-- Fix expires_at calculation in otp_verifications table
-- Update all existing records to have expires_at = created_at + 10 minutes

-- First, update all existing records to fix the expires_at calculation
UPDATE public.otp_verifications 
SET expires_at = (created_at + INTERVAL '10 minutes')
WHERE expires_at != (created_at + INTERVAL '10 minutes');

-- Create a function to automatically set expires_at when inserting new records
CREATE OR REPLACE FUNCTION set_otp_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expires_at to created_at + 10 minutes
    NEW.expires_at = NEW.created_at + INTERVAL '10 minutes';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expires_at on insert
DROP TRIGGER IF EXISTS trigger_set_otp_expires_at ON public.otp_verifications;
CREATE TRIGGER trigger_set_otp_expires_at
    BEFORE INSERT ON public.otp_verifications
    FOR EACH ROW
    EXECUTE FUNCTION set_otp_expires_at();

-- Add comment for documentation
COMMENT ON FUNCTION set_otp_expires_at() IS 'Automatically sets expires_at to created_at + 10 minutes for OTP records';
COMMENT ON TRIGGER trigger_set_otp_expires_at ON public.otp_verifications IS 'Ensures expires_at is always 10 minutes after created_at';