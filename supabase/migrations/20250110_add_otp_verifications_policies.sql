-- Add RLS policies for otp_verifications table

-- Policy to allow anyone to insert OTP records (for generating OTPs)
CREATE POLICY "Allow OTP insertion" ON public.otp_verifications
    FOR INSERT
    WITH CHECK (true);

-- Policy to allow anyone to read OTP records for verification
CREATE POLICY "Allow OTP verification" ON public.otp_verifications
    FOR SELECT
    USING (true);

-- Policy to allow updating OTP records (for marking as verified)
CREATE POLICY "Allow OTP status update" ON public.otp_verifications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy to allow deletion of expired OTP records (cleanup)
CREATE POLICY "Allow OTP cleanup" ON public.otp_verifications
    FOR DELETE
    USING (expires_at < NOW());

-- Create an index for better performance on phone_number and OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_otp 
    ON public.otp_verifications(phone_number, otp);

-- Create an index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at 
    ON public.otp_verifications(expires_at);

-- Optional: Create a function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.otp_verifications 
    WHERE expires_at < NOW() AND is_verified = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Comment explaining the policies
COMMENT ON TABLE public.otp_verifications IS 'Table for storing OTP verification codes with RLS policies allowing public access for authentication flows';