-- COMPLETE FIX FOR SOURCE FIELD
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop the blocking constraint
-- ============================================
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Drop idx_queries_whatsapp_unique constraint
  FOR rec IN 
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'queries'::regclass
      AND conname LIKE '%whatsapp%'
  LOOP
    EXECUTE format('ALTER TABLE queries DROP CONSTRAINT IF EXISTS %I', rec.conname);
    RAISE NOTICE 'Dropped constraint: %', rec.conname;
  END LOOP;
END $$;

-- ============================================
-- STEP 2: Update sources for WhatsApp queries
-- ============================================
-- First, let's see what we're working with
SELECT 
  'Before Update' as status,
  source, 
  COUNT(*) as count
FROM queries
GROUP BY source;

-- Update queries that should be WhatsApp
-- (have mobile number but no valid email)
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH whatsapp_queries AS (
    SELECT query_id
    FROM queries
    WHERE mobile_number IS NOT NULL
      AND mobile_number != ''
      AND (email IS NULL OR email = '' OR email = 'null')
  )
  UPDATE queries
  SET source = 'WhatsApp'
  FROM whatsapp_queries
  WHERE queries.query_id = whatsapp_queries.query_id
    AND queries.source != 'WhatsApp';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % queries to WhatsApp', updated_count;
END $$;

-- Verify the update
SELECT 
  'After Update' as status,
  source, 
  COUNT(*) as count
FROM queries
GROUP BY source;

-- ============================================
-- STEP 3: Remove source default value
-- ============================================
ALTER TABLE queries 
ALTER COLUMN source DROP DEFAULT;

RAISE NOTICE 'Source default removed';

-- ============================================
-- STEP 4: Show sample of updated records
-- ============================================
SELECT 
  query_id,
  CONCAT('TKT-', query_id) as ticket_number,
  name,
  mobile_number,
  email,
  source
FROM queries
ORDER BY query_id DESC
LIMIT 10;

-- Done!
SELECT 'Source field fix COMPLETE!' as status;
