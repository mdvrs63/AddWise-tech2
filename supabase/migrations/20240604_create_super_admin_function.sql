
-- Create a function to get super admin by email and password
CREATE OR REPLACE FUNCTION get_super_admin(p_email text, p_password text)
RETURNS TABLE(id integer, email text, full_name text, created_at timestamp)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.email, sa.full_name, sa.created_at
  FROM super_admins sa
  WHERE sa.email = p_email AND sa.password = p_password;
END;
$$;
