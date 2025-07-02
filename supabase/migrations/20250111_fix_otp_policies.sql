-- Fix OTP verification policies to allow anonymous access
-- Drop the incorrect policies that require authentication

-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Allow all operations on OTP verifications for authenticated users" ON public.otp_verifications;
DROP POLICY IF EXISTS "Allow all operations on employee data for authenticated users" ON public.employee_data;
DROP POLICY IF EXISTS "Allow all operations on employee login logs for authenticated users" ON public.employee_login_logs;
DROP POLICY IF EXISTS "Allow all operations on devices for authenticated users" ON public.devices;
DROP POLICY IF EXISTS "Allow all operations on GPS data for authenticated users" ON public.gps_data;
DROP POLICY IF EXISTS "Allow all operations on password resets for authenticated users" ON public.password_resets;
DROP POLICY IF EXISTS "Allow all operations on signup users for authenticated users" ON public.signup_users;
DROP POLICY IF EXISTS "Allow all operations on super admins for authenticated users" ON public.super_admins;

-- Recreate correct policies for OTP verifications (allowing anonymous access)
CREATE POLICY "Allow OTP insertion" ON public.otp_verifications
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow OTP verification" ON public.otp_verifications
    FOR SELECT
    USING (true);

CREATE POLICY "Allow OTP status update" ON public.otp_verifications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow OTP cleanup" ON public.otp_verifications
    FOR DELETE
    USING (expires_at < NOW());

-- Recreate appropriate policies for other tables
-- Employee data - only authenticated users should access
CREATE POLICY "Allow employee data access for authenticated users" ON public.employee_data
    FOR ALL
    TO authenticated
    USING (true);

-- Employee login logs - only authenticated users should access
CREATE POLICY "Allow employee login logs for authenticated users" ON public.employee_login_logs
    FOR ALL
    TO authenticated
    USING (true);

-- Devices - only authenticated users should access
CREATE POLICY "Allow device access for authenticated users" ON public.devices
    FOR ALL
    TO authenticated
    USING (true);

-- GPS data - only authenticated users should access
CREATE POLICY "Allow GPS data access for authenticated users" ON public.gps_data
    FOR ALL
    TO authenticated
    USING (true);

-- Password resets - allow anonymous access for password reset flow
CREATE POLICY "Allow password reset access" ON public.password_resets
    FOR ALL
    USING (true);

-- Signup users - allow anonymous access for signup flow
CREATE POLICY "Allow signup user access" ON public.signup_users
    FOR ALL
    USING (true);

-- Super admins - only authenticated users should access
CREATE POLICY "Allow super admin access for authenticated users" ON public.super_admins
    FOR ALL
    TO authenticated
    USING (true);

-- Add comment explaining the fix
COMMENT ON TABLE public.otp_verifications IS 'OTP verifications table with anonymous access policies for authentication flows';