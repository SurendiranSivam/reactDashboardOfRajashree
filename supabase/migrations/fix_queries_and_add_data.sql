-- ============================================
-- FIX: Query System Schema Issues & Add Test Data
-- ============================================

-- 1. Fix query_messages table type mismatch
ALTER TABLE query_messages 
ALTER COLUMN query_id TYPE bigint;

-- 2. Add test data to queries table
INSERT INTO queries (
    customer_id, 
    name, 
    mobile_number, 
    email, 
    message, 
    status, 
    source, 
    priority,
    created_at
) VALUES 
    (299, 'Surendar', '9787094776', NULL, 'Where is my order 10G115', 'Open', 'Phone', 'High', NOW()),
    (317, 'Arun', '9741804752', NULL, 'Chain Venum', 'Open', 'Email', 'Medium', NOW()),
    (NULL, 'Test Customer', '9876543210', 'test@example.com', 'Delivery delayed', 'In Progress', 'WhatsApp', 'High', NOW()),
    (NULL, 'John Doe', '9123456789', 'john@example.com', 'Product inquiry', 'Open', 'Email', 'Low', NOW()),
    (NULL, 'Jane Smith', '8765432109', NULL, 'Need help with order', 'Open', 'Phone', 'Medium', NOW());

-- 3. Verify data inserted
SELECT 
    query_id,
    name,
    mobile_number,
    source,
    status,
    priority,
    message,
    created_at
FROM queries 
ORDER BY created_at DESC;

-- 4. Check count
SELECT COUNT(*) as total_queries FROM queries;
