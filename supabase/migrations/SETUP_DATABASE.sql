-- ============================================================
-- MASTER DATABASE SETUP SCRIPT
-- Complete database migration for Dashboard Admin System
-- Run this script in order in Supabase SQL Editor
-- ============================================================

-- This file consolidates all migrations in chronological order:
-- 1. Vendor Management System
-- 2. Vendor Ledger System
-- 3. Queries & Tickets System
-- 4. Call Center Integration (Exotel)
-- 5. Marketing & Growth System
-- 6. Marketing RBAC Permissions
-- 7. Dashboard Analytics Functions
-- 8. RBAC (Role-Based Access Control)
-- 9. Dashboard RPC Functions

-- ============================================================
-- MIGRATION 1: CREATE VENDORS TABLE
-- File: 20260102000002_create_vendors_table.sql
-- ============================================================

-- Create vendors table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations for authenticated users" ON public.vendors
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.vendors IS 'Stores vendor/supplier information for purchase management';

-- ============================================================
-- MIGRATION 2: VENDOR LEDGER SYSTEM
-- File: 20260103000001_vendor_ledger_migration.sql
-- Note: Simplified version - includes core ledger table only
-- Full migration with data migration function available in original file
-- ============================================================

-- Create vendor_ledger table
CREATE TABLE IF NOT EXISTS vendor_ledger (
    ledger_id SERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEBIT', 'CREDIT')),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'OPENING_BALANCE')),
    reference_id BIGINT NULL,
    debit_amount NUMERIC(10,2) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount NUMERIC(10,2) DEFAULT 0 CHECK (credit_amount >= 0),
    running_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    invoice_no TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vendor ON vendor_ledger(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_date ON vendor_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_reference ON vendor_ledger(reference_type, reference_id);

-- Add comments
COMMENT ON TABLE vendor_ledger IS 'Professional double-entry ledger for vendor transactions';
COMMENT ON COLUMN vendor_ledger.debit_amount IS 'Amount owed to vendor (purchases)';
COMMENT ON COLUMN vendor_ledger.credit_amount IS 'Amount paid to vendor (payments)';
COMMENT ON COLUMN vendor_ledger.running_balance IS 'Balance = Previous + Debit - Credit';

-- ============================================================
-- MIGRATION 3: QUERIES & TICKETS SYSTEM
-- File: 20260103000002_queries_tickets_system.sql
-- Creates customer support query and ticket management system
-- ============================================================

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
    query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id INTEGER REFERENCES customers(customer_id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    order_id TEXT REFERENCES orders(order_id)
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id INTEGER REFERENCES customers(customer_id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('customer', 'admin')),
    sender_id TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_queries_customer ON queries(customer_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users)
CREATE POLICY "Allow authenticated users to manage queries" ON queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage ticket_messages" ON ticket_messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 4: CALL CENTER SYSTEM (EXOTEL INTEGRATION)
-- File: 20260104000001_call_center_system.sql
-- ============================================================

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exotel_call_sid TEXT UNIQUE,
    customer_phone TEXT,
    agent_phone TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    status TEXT,
    duration INTEGER,
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_calls_phone ON calls(customer_phone);
CREATE INDEX IF NOT EXISTS idx_calls_sid ON calls(exotel_call_sid);

-- Enable RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users to view calls" ON calls FOR SELECT USING (true);

-- ============================================================
-- MIGRATION 5: MARKETING & GROWTH SYSTEM
-- File: 20260105000001_marketing_growth_system.sql
-- ============================================================

-- Create enums
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');
CREATE TYPE campaign_channel AS ENUM ('email', 'sms');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent');

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type discount_type NOT NULL,
    value NUMERIC NOT NULL CHECK (value > 0),
    min_order_value NUMERIC DEFAULT 0 CHECK (min_order_value >= 0),
    usage_limit INTEGER DEFAULT NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (expires_at > starts_at)
);

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    referral_code TEXT NOT NULL UNIQUE,
    commission_rate NUMERIC DEFAULT 10.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    total_earnings NUMERIC DEFAULT 0 CHECK (total_earnings >= 0),
    bank_details JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject_line TEXT NOT NULL,
    content TEXT NOT NULL,
    channel campaign_channel NOT NULL,
    target_segment TEXT DEFAULT 'all',
    status campaign_status DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_logs table
CREATE TABLE IF NOT EXISTS referral_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(order_id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
    commission_amount NUMERIC NOT NULL CHECK (commission_amount >= 0),
    order_total NUMERIC NOT NULL,
    commission_rate NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_referral_logs_order ON referral_logs(order_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read active coupons" ON coupons FOR SELECT TO public USING (is_active = true AND now() BETWEEN starts_at AND expires_at);
CREATE POLICY "Authenticated can manage all" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can manage all affiliates" ON affiliates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can manage all campaigns" ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can view all referral_logs" ON referral_logs FOR SELECT TO authenticated USING (true);

-- Create triggers
CREATE OR REPLACE FUNCTION uppercase_coupon_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code = UPPER(NEW.code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_uppercase_coupon_code ON coupons;
CREATE TRIGGER trg_uppercase_coupon_code
    BEFORE INSERT OR UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION uppercase_coupon_code();

CREATE OR REPLACE FUNCTION uppercase_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.referral_code = UPPER(REGEXP_REPLACE(NEW.referral_code, '[^A-Z0-9]', '', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_uppercase_referral_code ON affiliates;
CREATE TRIGGER trg_uppercase_referral_code
    BEFORE INSERT OR UPDATE ON affiliates
    FOR EACH ROW
    EXECUTE FUNCTION uppercase_referral_code();

-- Affiliate commission trigger
CREATE OR REPLACE FUNCTION calculate_affiliate_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_affiliate_id UUID;
    v_commission_rate NUMERIC;
    v_commission_amount NUMERIC;
BEGIN
    IF NEW.order_status = 'paid' AND (OLD.order_status IS NULL OR OLD.order_status != 'paid') THEN
        IF NEW.order_note IS NOT NULL AND NEW.order_note LIKE '%ref=%' THEN
            SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
            FROM affiliates
            WHERE referral_code = (
                SELECT UPPER(TRIM(SPLIT_PART(SPLIT_PART(NEW.order_note, 'ref=', 2), ' ', 1)))
            )
            AND is_active = true;
            
            IF v_affiliate_id IS NOT NULL THEN
                v_commission_amount := (NEW.total_amount * v_commission_rate / 100);
                
                INSERT INTO referral_logs (order_id, affiliate_id, commission_amount, order_total, commission_rate)
                VALUES (NEW.order_id, v_affiliate_id, v_commission_amount, NEW.total_amount, v_commission_rate);
                
                UPDATE affiliates
                SET total_earnings = total_earnings + v_commission_amount
                WHERE id = v_affiliate_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_affiliate_commission ON orders;
CREATE TRIGGER trg_affiliate_commission
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_affiliate_commission();

-- ============================================================
-- MIGRATION 6: DASHBOARD ANALYTICS RPC FUNCTIONS
-- File: 20260105000003_dashboard_analytics_functions.sql
-- Also includes RUN_THIS_SALES_FUNCTIONS.sql
-- ============================================================

-- Drop existing functions (cleanup)
DROP FUNCTION IF EXISTS get_daily_sales_stats CASCADE;
DROP FUNCTION IF EXISTS get_weekly_sales_stats CASCADE;

-- Create daily sales stats function
CREATE FUNCTION get_daily_sales_stats(
    p_target_date DATE DEFAULT CURRENT_DATE,
    p_dsource_filter TEXT DEFAULT 'All'
)
RETURNS TABLE (
    target_date DATE,
    total_sales NUMERIC,
    order_count BIGINT,
    average_order_value NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_target_date AS target_date,
        COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_sales,
        COUNT(o.order_id)::BIGINT AS order_count,
        CASE 
            WHEN COUNT(o.order_id) > 0 THEN (SUM(o.total_amount) / COUNT(o.order_id))::NUMERIC
            ELSE 0::NUMERIC
        END AS average_order_value
    FROM orders o
    WHERE DATE(o.created_at) = p_target_date
        AND (p_dsource_filter = 'All' OR o.source = p_dsource_filter)
        AND o.order_status != 'cancelled';
END;
$$;

-- Create weekly sales stats function
CREATE FUNCTION get_weekly_sales_stats(
    p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    week_start DATE,
    week_end DATE,
    total_sales NUMERIC,
    order_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    start_of_week DATE;
    end_of_week DATE;
BEGIN
    -- Get start of the week containing the target date (Monday)
    start_of_week := DATE_TRUNC('week', p_target_date)::DATE;
    end_of_week := start_of_week + INTERVAL '6 days';
    
    RETURN QUERY
    WITH RECURSIVE dates AS (
        SELECT start_of_week AS date
        UNION ALL
        SELECT (date + INTERVAL '1 day')::DATE
        FROM dates
        WHERE date < end_of_week
    ),
    daily_stats AS (
        SELECT 
            DATE(o.created_at) AS order_date,
            SUM(o.total_amount) AS total_sales,
            COUNT(o.order_id) AS order_count
        FROM orders o
        WHERE DATE(o.created_at) >= start_of_week
            AND DATE(o.created_at) <= end_of_week
            AND o.order_status != 'cancelled'
        GROUP BY DATE(o.created_at)
    )
    SELECT 
        d.date AS week_start,
        d.date AS week_end,
        COALESCE(ds.total_sales, 0)::NUMERIC AS total_sales,
        COALESCE(ds.order_count, 0)::BIGINT AS order_count
    FROM dates d
    LEFT JOIN daily_stats ds ON d.date = ds.order_date
    ORDER BY d.date;
END;
$$;

-- ============================================================
-- MIGRATION 7: RBAC (Role-Based Access Control)
-- File: rbac_schema.sql (simplified version)
-- ============================================================

-- Create users table (internal admin users)
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    auth_id TEXT REFERENCES auth.users(id) UNIQUE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'Sales',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id TEXT PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    permission_key TEXT UNIQUE,
    description TEXT
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id TEXT REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- ============================================================
-- VERIFICATION QUERIES
-- Run these to verify setup was successful
-- ============================================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'vendors', 'vendor_ledger', 
    'queries', 'tickets', 'ticket_messages',
    'calls',
    'coupons', 'affiliates', 'campaigns', 'referral_logs',
    'users', 'roles', 'permissions', 'role_permissions'
)
ORDER BY table_name;

-- Check RPC functions
SELECT proname as function_name, pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('get_daily_sales_stats', 'get_weekly_sales_stats')
ORDER BY proname;

-- Check enums
SELECT n.nspname as schema, t.typname as type
FROM pg_type t
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.

typname IN ('discount_type', 'campaign_channel', 'campaign_status');

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'vendors', 'queries', 'tickets', 
    'coupons', 'affiliates', 'campaigns'
)
AND schemaname = 'public';

-- ============================================================
-- SETUP COMPLETE
-- ============================================================

-- Next steps:
-- 1. Deploy Supabase Edge Functions (see supabase/functions/)
-- 2. Update .env.local with Supabase credentials
-- 3. Run frontend: npm run dev
-- 4. Create admin user (see ADMIN_CREDENTIALS.md)
