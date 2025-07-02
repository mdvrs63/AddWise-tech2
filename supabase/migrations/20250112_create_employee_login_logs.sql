-- Create employee_login_logs table for tracking admin login activity
CREATE TABLE IF NOT EXISTS public.employee_login_logs (
    id serial NOT NULL PRIMARY KEY,
    employee_id character varying(20) NOT NULL,
    login_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_login_logs_employee_id 
        FOREIGN KEY (employee_id) 
        REFERENCES public.employee_data(employee_id) 
        ON DELETE CASCADE
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_login_logs_employee_id 
    ON public.employee_login_logs(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_login_logs_login_time 
    ON public.employee_login_logs(login_time DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.employee_login_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read login logs
CREATE POLICY "Allow authenticated users to read employee login logs" 
    ON public.employee_login_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert login logs
CREATE POLICY "Allow authenticated users to insert employee login logs" 
    ON public.employee_login_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.employee_login_logs IS 'Tracks admin/employee login activity for audit purposes';
COMMENT ON COLUMN public.employee_login_logs.employee_id IS 'References employee_data.employee_id';
COMMENT ON COLUMN public.employee_login_logs.login_time IS 'Timestamp when the admin logged in';