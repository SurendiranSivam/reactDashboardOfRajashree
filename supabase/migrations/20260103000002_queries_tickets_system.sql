-- ============================================
-- QUERIES & TICKETS SYSTEM - INCREMENTAL MIGRATION
-- Safely adds new columns to existing tables
-- ============================================

-- -----------------
-- STEP 1: Handle existing queries table
-- -----------------

-- Check if queries table exists, if not create it
CREATE TABLE IF NOT EXISTS queries (
    query_id SERIAL PRIMARY KEY,
    customer_id BIGINT,
    name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT,
    customer_email TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    order_id TEXT,
    priority TEXT DEFAULT 'Medium',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add source column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'queries' AND column_name = 'source') THEN
        ALTER TABLE queries ADD COLUMN source TEXT DEFAULT 'Email';
        RAISE NOTICE 'Added source column to queries table';
    END IF;
    
    -- Add is_escalated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'queries' AND column_name = 'is_escalated') THEN
        ALTER TABLE queries ADD COLUMN is_escalated BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_escalated column to queries table';
    END IF;
    
    -- Add escalated_ticket_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'queries' AND column_name = 'escalated_ticket_id') THEN
        ALTER TABLE queries ADD COLUMN escalated_ticket_id BIGINT;
        RAISE NOTICE 'Added escalated_ticket_id column to queries table';
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Status constraint
    BEGIN
        ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_status_check;
        ALTER TABLE queries ADD CONSTRAINT queries_status_check 
            CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Status constraint may already exist or error: %', SQLERRM;
    END;
    
    -- Priority constraint
    BEGIN
        ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_priority_check;
        ALTER TABLE queries ADD CONSTRAINT queries_priority_check 
            CHECK (priority IN ('High', 'Medium', 'Low'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Priority constraint may already exist';
    END;
    
    -- Source constraint
    BEGIN
        ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_source_check;
        ALTER TABLE queries ADD CONSTRAINT queries_source_check 
            CHECK (source IN ('Email', 'WhatsApp', 'Phone'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Source constraint may already exist';
    END;
END $$;

-- Add foreign key to customers if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_customer_id_fkey;
        ALTER TABLE queries ADD CONSTRAINT queries_customer_id_fkey 
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key to customers table';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_queries_customer ON queries(customer_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_source ON queries(source);
CREATE INDEX IF NOT EXISTS idx_queries_escalated ON queries(is_escalated);

COMMENT ON TABLE queries IS 'Tier 1: Initial customer inquiries from Email/WhatsApp/Phone';
COMMENT ON COLUMN queries.source IS 'Email (auto), WhatsApp (chatbot), or Phone (manual)';
COMMENT ON COLUMN queries.is_escalated IS 'TRUE if escalated to ticket';

-- -----------------
-- STEP 2: Create tickets table
-- -----------------
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id SERIAL PRIMARY KEY,
    query_id BIGINT,
    customer_id BIGINT,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'New',
    assigned_to TEXT,
    assigned_department TEXT,
    resolution TEXT,
    escalated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Add constraints for tickets
DO $$
BEGIN
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_category_check;
    ALTER TABLE tickets ADD CONSTRAINT tickets_category_check 
        CHECK (category IN ('Order Issue', 'Product Complaint', 'Delivery Problem', 'Payment Issue', 'Technical Support', 'Other'));
    
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_severity_check;
    ALTER TABLE tickets ADD CONSTRAINT tickets_severity_check 
        CHECK (severity IN ('Critical', 'High', 'Medium', 'Low'));
    
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
    ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
        CHECK (status IN ('New', 'Assigned', 'In Progress', 'Pending Customer', 'Pending Internal', 'Resolved', 'Closed'));
END $$;

-- Add foreign keys for tickets
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_query_id_fkey;
ALTER TABLE tickets ADD CONSTRAINT tickets_query_id_fkey 
    FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE SET NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_customer_id_fkey;
        ALTER TABLE tickets ADD CONSTRAINT tickets_customer_id_fkey 
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_severity ON tickets(severity);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);

COMMENT ON TABLE tickets IS 'Tier 2: Escalated serious issues';

-- -----------------
-- STEP 3: Conversation tables
-- -----------------
CREATE TABLE IF NOT EXISTS query_conversations (
    conversation_id SERIAL PRIMARY KEY,
    query_id BIGINT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('Customer', 'Admin')),
    sender_name TEXT,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE query_conversations DROP CONSTRAINT IF EXISTS query_conversations_query_id_fkey;
ALTER TABLE query_conversations ADD CONSTRAINT query_conversations_query_id_fkey 
    FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_query_conversations_query ON query_conversations(query_id);

CREATE TABLE IF NOT EXISTS ticket_conversations (
    conversation_id SERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('Customer', 'Team', 'Admin')),
    sender_name TEXT,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ticket_conversations DROP CONSTRAINT IF EXISTS ticket_conversations_ticket_id_fkey;
ALTER TABLE ticket_conversations ADD CONSTRAINT ticket_conversations_ticket_id_fkey 
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ticket_conversations_ticket ON ticket_conversations(ticket_id);

-- -----------------
-- STEP 4: Functions and triggers
-- -----------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_queries_updated ON queries;
CREATE TRIGGER trg_queries_updated
    BEFORE UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_tickets_updated ON tickets;
CREATE TRIGGER trg_tickets_updated
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    counter INTEGER;
    ticket_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COUNT(*) + 1 INTO counter FROM tickets WHERE ticket_number LIKE 'TKT-' || year || '-%';
    ticket_num := 'TKT-' || year || '-' || LPAD(counter::TEXT, 3, '0');
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- -----------------
-- STEP 5: View (fix column names)
-- -----------------
DROP VIEW IF EXISTS customer_support_summary CASCADE;

DO $$
BEGIN
    -- Try to create view with different customer column names
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'full_name') THEN
        EXECUTE 'CREATE OR REPLACE VIEW customer_support_summary AS
        SELECT 
            c.customer_id,
            c.full_name as name,
            c.email,
            c.mobile,
            COUNT(DISTINCT q.query_id) as total_queries,
            COUNT(DISTINCT t.ticket_id) as total_tickets,
            COUNT(DISTINCT CASE WHEN q.status = ''Open'' THEN q.query_id END) as open_queries,
            COUNT(DISTINCT CASE WHEN t.status IN (''New'', ''Assigned'', ''In Progress'') THEN t.ticket_id END) as active_tickets
        FROM customers c
        LEFT JOIN queries q ON q.customer_id = c.customer_id
        LEFT JOIN tickets t ON t.customer_id = c.customer_id
        GROUP BY c.customer_id, c.full_name, c.email, c.mobile';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
        EXECUTE 'CREATE OR REPLACE VIEW customer_support_summary AS
        SELECT 
            c.customer_id,
            c.name,
            c.email,
            c.mobile,
            COUNT(DISTINCT q.query_id) as total_queries,
            COUNT(DISTINCT t.ticket_id) as total_tickets,
            COUNT(DISTINCT CASE WHEN q.status = ''Open'' THEN q.query_id END) as open_queries,
            COUNT(DISTINCT CASE WHEN t.status IN (''New'', ''Assigned'', ''In Progress'') THEN t.ticket_id END) as active_tickets
        FROM customers c
        LEFT JOIN queries q ON q.customer_id = c.customer_id
        LEFT JOIN tickets t ON t.customer_id = c.customer_id
        GROUP BY c.customer_id, c.name, c.email, c.mobile';
    ELSE
        RAISE NOTICE 'Customers table structure unknown - view not created';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create view: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Queries & Tickets system migration completed!';
    RAISE NOTICE '📋 Queries table updated with new columns';
    RAISE NOTICE '🎫 Tickets table created';
    RAISE NOTICE '💬 Conversation tables created';
END $$;
