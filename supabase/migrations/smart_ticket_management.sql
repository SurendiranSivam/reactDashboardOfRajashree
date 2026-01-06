-- Smart Ticket Management System
-- Consolidates messages into existing tickets instead of creating duplicates

-- Function to find or create ticket
CREATE OR REPLACE FUNCTION find_or_create_ticket(
  p_source VARCHAR(20),
  p_name VARCHAR(100),
  p_mobile VARCHAR(20),
  p_email VARCHAR(100),
  p_order_id VARCHAR(50),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium'
)
RETURNS INTEGER AS $$
DECLARE
  v_ticket_id INTEGER;
  v_existing_ticket INTEGER;
BEGIN
  -- Try to find an OPEN ticket for this customer + order combination
  SELECT query_id INTO v_existing_ticket
  FROM queries
  WHERE source = p_source
    AND mobile_number = p_mobile
    AND COALESCE(order_id, '') = COALESCE(p_order_id, '')
    AND status NOT IN ('Closed', 'Resolved')
  ORDER BY created_at DESC
  LIMIT 1;

  -- If open ticket exists, use it
  IF v_existing_ticket IS NOT NULL THEN
    -- Add the new message to existing ticket
    INSERT INTO query_messages (query_id, sender_type, message, delivered)
    VALUES (v_existing_ticket, 'customer', p_message, true);
    
    RETURN v_existing_ticket;
  END IF;

  -- No open ticket found, create new one
  INSERT INTO queries (
    source, name, mobile_number, email, order_id, 
    message, priority, status, created_at
  )
  VALUES (
    p_source, p_name, p_mobile, p_email, p_order_id,
    p_message, p_priority, 'Open', NOW()
  )
  RETURNING query_id INTO v_ticket_id;

  -- Add initial message
  INSERT INTO query_messages (query_id, sender_type, message, delivered)
  VALUES (v_ticket_id, 'customer', p_message, true);

  RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT find_or_create_ticket(
--   'WhatsApp', 'John Doe', '9876543210', NULL, 'ORD-123', 
--   'Where is my order?', 'medium'
-- );

-- Test the function with your data
SELECT find_or_create_ticket(
  'WhatsApp', 
  'Test Customer', 
  '917373166011', 
  NULL, 
  NULL,
  'Test message 1',
  'medium'
) as ticket_id;

-- Send another message (should use same ticket)
SELECT find_or_create_ticket(
  'WhatsApp', 
  'Test Customer', 
  '917373166011', 
  NULL, 
  NULL,
  'Test message 2',
  'medium'
) as ticket_id;

-- Verify: Should have 1 ticket with 2 messages
SELECT 
  q.query_id as ticket_id,
  CONCAT('TKT-', q.query_id) as ticket_number,
  q.name,
  q.mobile_number,
  q.status,
  COUNT(m.message_id) as message_count
FROM queries q
LEFT JOIN query_messages m ON q.query_id = m.query_id
WHERE q.mobile_number = '917373166011'
GROUP BY q.query_id, q.name, q.mobile_number, q.status;
