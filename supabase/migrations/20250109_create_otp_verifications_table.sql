-- Create the new otp_verifications table
CREATE TABLE public.otp_verifications (
    id serial PRIMARY KEY,
    phone_number character varying(20) NOT NULL,
    otp character varying(6) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    expires_at timestamp with time zone NOT NULL,
    is_verified boolean NOT NULL DEFAULT false
);

-- Optional: Add a unique constraint if you want to prevent multiple active OTPs per phone
-- (This ensures only one unverified OTP per number can exist at a time)
-- CREATE UNIQUE INDEX unique_unverified_otp_per_phone
-- ON public.otp_verifications(phone_number)
-- WHERE is_verified = false;

-- Enable Row-Level Security
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Update super_admins table to remove otp column and password, add phone_number
-- First, add phone_number column if it doesn't exist
ALTER TABLE public.super_admins ADD COLUMN IF NOT EXISTS phone_number character varying(20);

-- Remove email and password columns if they exist
ALTER TABLE public.super_admins DROP COLUMN IF EXISTS email;
ALTER TABLE public.super_admins DROP COLUMN IF EXISTS password;
ALTER TABLE public.super_admins DROP COLUMN IF EXISTS otp;

-- Make phone_number NOT NULL after adding it
ALTER TABLE public.super_admins ALTER COLUMN phone_number SET NOT NULL;

-- Drop the old get_super_admin function that uses email/password
DROP FUNCTION IF EXISTS get_super_admin(text, text);

-- Create a new function to get super admin by phone number
CREATE OR REPLACE FUNCTION get_super_admin_by_phone(p_phone_number text)
RETURNS TABLE(id integer, phone_number text, full_name text, created_at timestamp)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.phone_number, sa.full_name, sa.created_at
  FROM super_admins sa
  WHERE sa.phone_number = p_phone_number;
END;
$$;

-- Migrate any existing OTP data from password_resets to otp_verifications
-- (if password_resets table exists and has phone_number column)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'password_resets') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'password_resets' AND column_name = 'phone_number') THEN
            INSERT INTO public.otp_verifications (phone_number, otp, created_at, expires_at, is_verified)
            SELECT phone_number, otp, created_at, expires_at, COALESCE(is_verified, false)
            FROM public.password_resets
            WHERE phone_number IS NOT NULL;
        END IF;
    END IF;
END
$$;