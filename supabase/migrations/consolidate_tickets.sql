-- Consolidate Existing Duplicate Tickets
-- This will merge duplicate tickets from the same customer+order into one ticket

-- Step 1: Identify duplicates
SELECT 
  mobile_number,
  COALESCE(order_id, 'NO_ORDER') as order_id,
  COUNT(*) as ticket_count,
  STRING_AGG(CAST(query_id AS TEXT), ', ' ORDER BY query_id) as ticket_ids
FROM queries
WHERE source = 'WhatsApp'
GROUP BY mobile_number, COALESCE(order_id, 'NO_ORDER')
HAVING COUNT(*) > 1
ORDER BY ticket_count DESC;

-- Step 2: Consolidate messages into the oldest ticket
-- For each group of duplicates, move all messages to the oldest ticket

DO $$
DECLARE
  rec RECORD;
  oldest_ticket INTEGER;
  duplicate_ticket INTEGER;
BEGIN
  -- Loop through each customer+order group that has duplicates
  FOR rec IN 
    SELECT 
      mobile_number,
      COALESCE(order_id, '') as order_id,
      ARRAY_AGG(query_id ORDER BY query_id) as ticket_ids
    FROM queries
    WHERE source = 'WhatsApp'
    GROUP BY mobile_number, COALESCE(order_id, '')
    HAVING COUNT(*) > 1
  LOOP
    -- First ticket in the array is the oldest (lowest ID)
    oldest_ticket := rec.ticket_ids[1];
    
    -- For each duplicate ticket (skip the first one)
    FOR i IN 2..ARRAY_LENGTH(rec.ticket_ids, 1) LOOP
      duplicate_ticket := rec.ticket_ids[i];
      
      -- Move all messages from duplicate to oldest ticket
      UPDATE query_messages
      SET query_id = oldest_ticket
      WHERE query_id = duplicate_ticket;
      
      -- Delete the duplicate ticket
      DELETE FROM queries WHERE query_id = duplicate_ticket;
      
      RAISE NOTICE 'Consolidated ticket % into ticket %', duplicate_ticket, oldest_ticket;
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Verify consolidation
SELECT 
  mobile_number,
  COALESCE(order_id, 'NO_ORDER') as order_id,
  COUNT(*) as ticket_count,
  STRING_AGG(CONCAT('TKT-', CAST(query_id AS TEXT)), ', ' ORDER BY query_id) as ticket_numbers
FROM queries
WHERE source = 'WhatsApp'
GROUP BY mobile_number, COALESCE(order_id, 'NO_ORDER')
ORDER BY ticket_count DESC;

-- Step 4: Check message counts for consolidated tickets
SELECT 
  q.query_id,
  CONCAT('TKT-', q.query_id) as ticket_number,
  q.name,
  q.mobile_number,
  q.order_id,
  q.status,
  COUNT(m.message_id) as total_messages,
  MIN(m.sent_at) as first_message,
  MAX(m.sent_at) as last_message
FROM queries q
LEFT JOIN query_messages m ON q.query_id = m.query_id
WHERE q.source = 'WhatsApp'
GROUP BY q.query_id, q.name, q.mobile_number, q.order_id, q.status
HAVING COUNT(m.message_id) > 1
ORDER BY total_messages DESC
LIMIT 20;
