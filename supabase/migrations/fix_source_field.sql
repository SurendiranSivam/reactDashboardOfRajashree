-- Fix Source Field - Complete Solution
-- Step 1: Remove default value from source column
ALTER TABLE queries ALTER COLUMN source DROP DEFAULT;

-- Step 2: Check current sources
SELECT source, COUNT(*) as count
FROM queries
GROUP BY source;

-- Step 3: Update queries that should be WhatsApp
-- Logic: If they have mobile but no email, they're WhatsApp
UPDATE queries
SET source = 'WhatsApp'
WHERE mobile_number IS NOT NULL
  AND mobile_number != ''
  AND (email IS NULL OR email = '' OR email = 'null');

-- Step 4: Verify the update
SELECT source, COUNT(*) as count
FROM queries
GROUP BY source;

-- Step 5: Show updated queries with their sources
SELECT 
  query_id,
  CONCAT('TKT-', query_id) as ticket_number,
  name,
  mobile_number,
  email,
  source
FROM queries
ORDER BY query_id DESC
LIMIT 20;
