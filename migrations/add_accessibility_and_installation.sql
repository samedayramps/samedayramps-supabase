-- Create customer_accessibility_requirements table
CREATE TABLE IF NOT EXISTS public.customer_accessibility_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    mobility_device TEXT NOT NULL CHECK (mobility_device IN ('wheelchair', 'walker', 'scooter', 'other')),
    device_width NUMERIC(5,2),
    device_length NUMERIC(5,2),
    device_turning_radius NUMERIC(5,2),
    user_weight NUMERIC(6,2),
    assistance_required BOOLEAN DEFAULT false,
    special_requirements TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create installation_details table
CREATE TABLE IF NOT EXISTS public.installation_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    installed_by TEXT[],
    installation_start TIMESTAMP WITH TIME ZONE,
    installation_end TIMESTAMP WITH TIME ZONE,
    equipment_used TEXT[],
    modifications_required BOOLEAN DEFAULT false,
    modification_details TEXT,
    actual_length NUMERIC(6,2),
    actual_rise NUMERIC(6,2),
    number_of_sections INTEGER,
    handrails_secure BOOLEAN,
    surface_stable BOOLEAN,
    proper_slope BOOLEAN,
    platform_secure BOOLEAN,
    photos JSONB DEFAULT '{"before": [], "after": [], "details": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_accessibility_requirements_customer_id 
ON public.customer_accessibility_requirements(customer_id);

CREATE INDEX IF NOT EXISTS idx_installation_details_job_id 
ON public.installation_details(job_id); 