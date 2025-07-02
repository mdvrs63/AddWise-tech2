-- Fix OTP verification timezone issues
-- Update the created_at column to use UTC instead of Asia/Kolkata timezone

-- Drop the existing default constraint
ALTER TABLE public.otp_verifications 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- Add a function to clean up expired OTPs automatically
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.otp_verifications 
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND is_verified = false;
END;
$$;

-- Create an index on expires_at for better performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at 
ON public.otp_verifications(expires_at);

-- Create an index on phone_number and is_verified for better query performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_verified 
ON public.otp_verifications(phone_number, is_verified);

-- Add a comment explaining the timezone fix
COMMENT ON TABLE public.otp_verifications IS 'OTP verifications table with UTC timestamps for consistent timezone handling';
COMMENT ON COLUMN public.otp_verifications.created_at IS 'Creation timestamp in UTC';
COMMENT ON COLUMN public.otp_verifications.expires_at IS 'Expiration timestamp in UTC';