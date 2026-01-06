-- Setup RLS policies and RPC function for existing queries table
-- Run this in your Supabase SQL Editor

-- 1. Enable Row Level Security (if not already enabled)
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view queries" ON queries;
DROP POLICY IF EXISTS "Allow authenticated users to insert queries" ON queries;
DROP POLICY IF EXISTS "Allow authenticated users to update queries" ON queries;
DROP POLICY IF EXISTS "Allow authenticated users to delete queries" ON queries;
DROP POLICY IF EXISTS "Allow anon to view queries" ON queries;

-- 3. Create RLS policies
CREATE POLICY "Allow authenticated users to view queries"
    ON queries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow anon to view queries"
    ON queries FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated users to insert queries"
    ON queries FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update queries"
    ON queries FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete queries"
    ON queries FOR DELETE
    TO authenticated
    USING (true);

-- 4. Create/Replace the RPC function
CREATE OR REPLACE FUNCTION get_queries_full()
RETURNS TABLE (
    query_id BIGINT,
    customer_id BIGINT,
    name VARCHAR,
    mobile_number VARCHAR,
    email VARCHAR,
    message TEXT,
    status VARCHAR,
    priority TEXT,
    order_id TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    order_date TIMESTAMP WITH TIME ZONE,
    customer_email VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.query_id,
        q.customer_id,
        q.name,
        q.mobile_number,
        q.email,
        q.message,
        q.status,
        q.priority,
        q.order_id,
        q.remarks,
        q.created_at,
        o.created_at as order_date,
        c.email as customer_email
    FROM queries q
    LEFT JOIN orders o ON q.order_id = o.order_id
    LEFT JOIN customers c ON q.customer_id = c.customer_id
    ORDER BY q.created_at DESC;
END;
$$;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_queries_full() TO authenticated;
GRANT EXECUTE ON FUNCTION get_queries_full() TO anon;

-- 6. Insert sample data for testing (only if table is empty)
INSERT INTO queries (name, mobile_number, email, message, status, priority, order_id, remarks, created_at)
SELECT * FROM (VALUES 
    ('John Doe', '9876543210', 'john@example.com', 'Where is my order? I placed it 3 days ago.', 'Open', 'High', NULL, NULL, NOW()),
    ('Jane Smith', '9123456789', 'jane@example.com', 'I received wrong size. Need exchange.', 'In Progress', 'High', NULL, 'Contacted customer', NOW() - INTERVAL '1 day'),
    ('Ravi Kumar', '8765432109', 'ravi@example.com', 'Product quality issue. Color faded after wash.', 'Open', 'Medium', NULL, NULL, NOW() - INTERVAL '2 days'),
    ('Priya Sharma', '7654321098', 'priya@example.com', 'Request for bulk order pricing', 'Resolved', 'Low', NULL, 'Sent catalog', NOW() - INTERVAL '3 days'),
    ('Amit Patel', '6543210987', 'amit@example.com', 'Delivery delayed. Need urgent delivery.', 'Closed', 'High', NULL, 'Issue resolved', NOW() - INTERVAL '5 days')
) AS v(name, mobile_number, email, message, status, priority, order_id, remarks, created_at)
WHERE NOT EXISTS (SELECT 1 FROM queries LIMIT 1);

-- 7. Check how many queries exist now
SELECT COUNT(*) as total_queries FROM queries;
