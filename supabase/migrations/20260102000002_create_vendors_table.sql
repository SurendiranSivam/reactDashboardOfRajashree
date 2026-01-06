-- Create vendors table
-- This table stores vendor/supplier information for purchase management

CREATE TABLE IF NOT EXISTS public.vendors (
    vendor_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    gst TEXT DEFAULT '',
    email TEXT,
    contact_person TEXT,
    payment_terms TEXT,
    bank_account TEXT,
    ifsc TEXT,
    pan_number TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create index on vendor name for faster searches
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Adjust this based on your security requirements
CREATE POLICY "Allow all operations for authenticated users" ON public.vendors
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.vendors IS 'Stores vendor/supplier information for purchase management';

-- Add comments to columns
COMMENT ON COLUMN public.vendors.vendor_id IS 'Primary key, auto-incrementing vendor ID';
COMMENT ON COLUMN public.vendors.name IS 'Vendor/supplier name (required)';
COMMENT ON COLUMN public.vendors.address IS 'Full address of the vendor (required)';
COMMENT ON COLUMN public.vendors.contact_number IS 'Primary contact number (required)';
COMMENT ON COLUMN public.vendors.gst IS 'GST number of the vendor';
COMMENT ON COLUMN public.vendors.email IS 'Email address of the vendor';
COMMENT ON COLUMN public.vendors.contact_person IS 'Primary contact person name';
COMMENT ON COLUMN public.vendors.payment_terms IS 'Payment terms (e.g., Net 30 days)';
COMMENT ON COLUMN public.vendors.bank_account IS 'Bank account number';
COMMENT ON COLUMN public.vendors.ifsc IS 'IFSC code for bank transfers';
COMMENT ON COLUMN public.vendors.pan_number IS 'PAN number of the vendor';
COMMENT ON COLUMN public.vendors.notes IS 'Additional notes about the vendor';
COMMENT ON COLUMN public.vendors.is_active IS 'Whether the vendor is currently active';
COMMENT ON COLUMN public.vendors.created_at IS 'Timestamp when the vendor was created';
COMMENT ON COLUMN public.vendors.updated_at IS 'Timestamp when the vendor was last updated';
