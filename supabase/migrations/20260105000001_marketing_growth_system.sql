-- ============================================
-- MARKETING & GROWTH MODULE - DATABASE SCHEMA
-- Coupons, Affiliates, Campaigns, Referrals
-- ============================================

-- -----------------
-- STEP 1: Create Enums
-- -----------------

-- Discount types for coupons
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');

-- Campaign channels
CREATE TYPE campaign_channel AS ENUM ('email', 'sms');

-- Campaign statuses
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent');

-- -----------------
-- STEP 2: Coupons Table
-- -----------------
CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    type discount_type NOT NULL,
    value numeric NOT NULL CHECK (value > 0),
    min_order_value numeric DEFAULT 0 CHECK (min_order_value >= 0),
    usage_limit integer DEFAULT NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count integer DEFAULT 0 CHECK (usage_count >= 0),
    starts_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT valid_dates CHECK (expires_at > starts_at)
);

-- Ensure code is always uppercase
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

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at);

COMMENT ON TABLE coupons IS 'Discount coupons for marketing campaigns';

-- -----------------
-- STEP 3: Affiliates Table
-- -----------------
CREATE TABLE IF NOT EXISTS affiliates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    referral_code text NOT NULL UNIQUE,
    commission_rate numeric DEFAULT 10.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    total_earnings numeric DEFAULT 0 CHECK (total_earnings >= 0),
    bank_details jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ensure referral code is uppercase alphanumeric
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

CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);

COMMENT ON TABLE affiliates IS 'Affiliate partners who earn commission on referrals';

-- -----------------
-- STEP 4: Campaigns Table
-- -----------------
CREATE TABLE IF NOT EXISTS campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    subject_line text NOT NULL,
    content text NOT NULL,
    channel campaign_channel NOT NULL,
    target_segment text DEFAULT 'all',
    status campaign_status DEFAULT 'draft',
    sent_at timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);

COMMENT ON TABLE campaigns IS 'Email and SMS marketing campaigns';

-- -----------------
-- STEP 5: Referral Logs Table
-- -----------------
CREATE TABLE IF NOT EXISTS referral_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text REFERENCES orders(order_id) ON DELETE CASCADE,
    affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL,
    commission_amount numeric NOT NULL CHECK (commission_amount >= 0),
    order_total numeric NOT NULL,
    commission_rate numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_logs_order ON referral_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_referral_logs_affiliate ON referral_logs(affiliate_id);

COMMENT ON TABLE referral_logs IS 'Commission tracking for affiliate orders';

-- -----------------
-- STEP 6: Affiliate Commission Trigger
-- -----------------
CREATE OR REPLACE FUNCTION calculate_affiliate_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_affiliate_id uuid;
    v_commission_rate numeric;
    v_commission_amount numeric;
BEGIN
    -- Only process when order status changes to 'paid'
    IF NEW.order_status = 'paid' AND (OLD.order_status IS NULL OR OLD.order_status != 'paid') THEN
        
        -- Check if order has affiliate_code (stored in order_note or custom field)
        -- For this implementation, we'll assume affiliate_code is in order_note
        IF NEW.order_note IS NOT NULL AND NEW.order_note LIKE '%ref=%' THEN
            
            -- Extract referral code from order_note
            SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
            FROM affiliates
            WHERE referral_code = (
                SELECT UPPER(TRIM(SPLIT_PART(SPLIT_PART(NEW.order_note, 'ref=', 2), ' ', 1)))
            )
            AND is_active = true;
            
            IF v_affiliate_id IS NOT NULL THEN
                -- Calculate commission
                v_commission_amount := (NEW.total_amount * v_commission_rate / 100);
                
                -- Insert referral log
                INSERT INTO referral_logs (
                    order_id,
                    affiliate_id,
                    commission_amount,
                    order_total,
                    commission_rate
                ) VALUES (
                    NEW.order_id,
                    v_affiliate_id,
                    v_commission_amount,
                    NEW.total_amount,
                    v_commission_rate
                );
                
                -- Update affiliate total earnings
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

-- -----------------
-- STEP 7: RLS Policies
-- -----------------

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_logs ENABLE ROW LEVEL SECURITY;

-- Coupons: Public read (for validation), Admin full access
DROP POLICY IF EXISTS "Public can read active coupons" ON coupons;
CREATE POLICY "Public can read active coupons"
    ON coupons FOR SELECT
    TO public
    USING (is_active = true AND now() BETWEEN starts_at AND expires_at);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
    ON coupons FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM users WHERE user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()::text LIMIT 1)) = 'Admin'
    );

-- Affiliates: Users can view their own, Admins full access
DROP POLICY IF EXISTS "Users can view own affiliate" ON affiliates;
CREATE POLICY "Users can view own affiliate"
    ON affiliates FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage affiliates" ON affiliates;
CREATE POLICY "Admins can manage affiliates"
    ON affiliates FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM users WHERE user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()::text LIMIT 1)) = 'Admin'
    );

-- Campaigns: Admin only
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
CREATE POLICY "Admins can manage campaigns"
    ON campaigns FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM users WHERE user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()::text LIMIT 1)) = 'Admin'
    );

-- Referral Logs: Users can view their own, Admins view all
DROP POLICY IF EXISTS "Users can view own referrals" ON referral_logs;
CREATE POLICY "Users can view own referrals"
    ON referral_logs FOR SELECT
    TO authenticated
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all referrals" ON referral_logs;
CREATE POLICY "Admins can view all referrals"
    ON referral_logs FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM users WHERE user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()::text LIMIT 1)) = 'Admin'
    );

-- -----------------
-- VERIFICATION QUERIES
-- -----------------

-- Check enums created
SELECT n.nspname as schema, t.typname as type
FROM pg_type t
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname IN ('discount_type', 'campaign_channel', 'campaign_status');

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('coupons', 'affiliates', 'campaigns', 'referral_logs');

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('coupons', 'affiliates', 'campaigns', 'referral_logs');
