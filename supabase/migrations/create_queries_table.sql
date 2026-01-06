-- Create queries table for Customer Queries functionality
-- Run this in your Supabase SQL Editor

-- 1. Create the queries table
CREATE TABLE IF NOT EXISTS queries (
    query_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    order_id VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_order_id ON queries(order_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies (allow authenticated users full access)
CREATE POLICY "Allow authenticated users to view queries"
    ON queries FOR SELECT
    TO authenticated
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

-- 5. Create the RPC function for fetching queries with joined data
CREATE OR REPLACE FUNCTION get_queries_full()
RETURNS TABLE (
    query_id INTEGER,
    customer_id INTEGER,
    name VARCHAR,
    mobile_number VARCHAR,
    email VARCHAR,
    message TEXT,
    status VARCHAR,
    priority VARCHAR,
    order_id VARCHAR,
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

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_queries_full() TO authenticated;
GRANT EXECUTE ON FUNCTION get_queries_full() TO anon;

-- 7. Insert sample data (optional - for testing)
INSERT INTO queries (name, mobile_number, email, message, status, priority, order_id, remarks)
VALUES 
    ('John Doe', '9876543210', 'john@example.com', 'Where is my order? I placed it 3 days ago.', 'Open', 'High', 'ORD-001', NULL),
    ('Jane Smith', '9123456789', 'jane@example.com', 'I received wrong size. Need exchange.', 'In Progress', 'High', 'ORD-002', 'Contacted customer, awaiting return'),
    ('Ravi Kumar', '8765432109', 'ravi@example.com', 'Product quality issue. Color faded after wash.', 'Open', 'Medium', NULL, NULL),
    ('Priya Sharma', '7654321098', 'priya@example.com', 'Request for bulk order pricing', 'Resolved', 'Low', NULL, 'Sent catalog with bulk pricing'),
    ('Amit Patel', '6543210987', 'amit@example.com', 'Delivery delayed. Need urgent delivery.', 'Closed', 'Critical', 'ORD-003', 'Expedited shipping arranged');

-- Done! Your queries table is now ready.
