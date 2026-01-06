-- ============================================
-- VOICE CALL CENTER - DATABASE SCHEMA
-- Exotel Integration with IVR, Call Logging & Recording
-- ============================================

-- -----------------
-- STEP 1: Call Logs Table
-- -----------------
CREATE TABLE IF NOT EXISTS call_logs (
    call_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid text UNIQUE NOT NULL, -- Exotel's call ID
    from_number text NOT NULL, -- Customer phone
    to_number text NOT NULL, -- Virtual number
    executive_id bigint REFERENCES users(user_id),
    customer_id bigint REFERENCES customers(customer_id),
    
    -- Call Details
    direction text DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
    status text DEFAULT 'ringing', -- ringing, in-progress, completed, no-answer, busy, failed
    duration integer DEFAULT 0, -- seconds
    recording_url text,
    recording_duration integer, -- seconds
    
    -- IVR Selection
    ivr_selection text, -- Sales/Support/Returns
    
    -- Auto Query Creation
    query_id bigint REFERENCES queries(query_id),
    auto_query_created boolean DEFAULT false,
    
    -- Timestamps
    started_at timestamp with time zone DEFAULT now(),
    answered_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_executive ON call_logs(executive_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer ON call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_date ON call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_query ON call_logs(query_id);

COMMENT ON TABLE call_logs IS 'Stores all inbound and outbound call records from Exotel';
COMMENT ON COLUMN call_logs.call_sid IS 'Exotel unique call identifier';
COMMENT ON COLUMN call_logs.ivr_selection IS 'Customer selection: 1=Sales, 2=Support, 3=Returns';

-- -----------------
-- STEP 2: Executive Availability Table
-- -----------------
CREATE TABLE IF NOT EXISTS executive_availability (
    availability_id serial PRIMARY KEY,
    executive_id bigint REFERENCES users(user_id) UNIQUE NOT NULL,
    status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'on-call', 'break')),
    current_call_id uuid REFERENCES call_logs(call_id),
    
    -- Statistics
    last_call_at timestamp with time zone,
    total_calls_today integer DEFAULT 0,
    total_duration_today integer DEFAULT 0, -- seconds
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_executive_availability_status ON executive_availability(status);
CREATE INDEX IF NOT EXISTS idx_executive_availability_executive ON executive_availability(executive_id);

COMMENT ON TABLE executive_availability IS 'Real-time availability status of CS executives for call routing';
COMMENT ON COLUMN executive_availability.status IS 'online=Ready for calls, on-call=Currently on call, break=Temporarily unavailable';

-- -----------------
-- STEP 3: Call Queue Table
-- -----------------
CREATE TABLE IF NOT EXISTS call_queue (
    queue_id serial PRIMARY KEY,
    call_sid text NOT NULL,
    from_number text NOT NULL,
    ivr_selection text,
    queue_position integer,
    wait_time integer DEFAULT 0, -- seconds
    status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'abandoned', 'timeout')),
    
    -- Timestamps
    queued_at timestamp with time zone DEFAULT now(),
    connected_at timestamp with time zone,
    ended_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_call_queue_status ON call_queue(status);
CREATE INDEX IF NOT EXISTS idx_call_queue_queued ON call_queue(queued_at DESC);

COMMENT ON TABLE call_queue IS 'Manages call queue when all executives are busy';

-- -----------------
-- STEP 4: Auto-update Triggers
-- -----------------

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_call_logs_updated_at ON call_logs;
CREATE TRIGGER trg_call_logs_updated_at
    BEFORE UPDATE ON call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_call_logs_updated_at();

-- Update executive availability
CREATE OR REPLACE FUNCTION update_executive_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_executive_availability_updated_at ON executive_availability;
CREATE TRIGGER trg_executive_availability_updated_at
    BEFORE UPDATE ON executive_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_executive_availability_updated_at();

-- -----------------
-- STEP 5: View for Call Analytics
-- -----------------
CREATE OR REPLACE VIEW call_analytics AS
SELECT 
    DATE(started_at) as call_date,
    executive_id,
    u.full_name as executive_name,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as answered_calls,
    COUNT(CASE WHEN status = 'no-answer' THEN 1 END) as missed_calls,
    AVG(duration) as avg_duration,
    SUM(duration) as total_duration
FROM call_logs cl
LEFT JOIN users u ON cl.executive_id = u.user_id
WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(started_at), executive_id, u.full_name
ORDER BY call_date DESC, total_calls DESC;

COMMENT ON VIEW call_analytics IS 'Daily call statistics per executive for last 30 days';

-- -----------------
-- STEP 6: Sample Data for Testing
-- -----------------

-- Add executives to availability table (run after users exist)
DO $$
BEGIN
    -- Insert availability for existing CS executives
    INSERT INTO executive_availability (executive_id, status)
    SELECT user_id, 'offline'
    FROM users
    WHERE role IN ('Executive', 'Admin', 'Manager')
    ON CONFLICT (executive_id) DO NOTHING;
END $$;

-- -----------------
-- VERIFICATION QUERIES
-- -----------------

-- Check tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('call_logs', 'executive_availability', 'call_queue');

-- Check indexes created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('call_logs', 'executive_availability', 'call_queue');

-- Check view created
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'call_analytics';
