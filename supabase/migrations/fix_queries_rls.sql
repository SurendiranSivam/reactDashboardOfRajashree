-- ============================================
-- FIX: Queries Not Fetching - RLS Issue
-- ============================================

-- STEP 1: Check if RLS is enabled on queries table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'queries';

-- STEP 2: Check existing RLS policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'queries';

-- STEP 3: OPTION A - Disable RLS temporarily for testing
ALTER TABLE queries DISABLE ROW LEVEL SECURITY;

-- STEP 4: OPTION B - Add RLS policy to allow SELECT (if you want to keep RLS enabled)
-- This allows anyone to read queries
CREATE POLICY "Allow public read access to queries"
ON queries
FOR SELECT
TO public
USING (true);

-- STEP 5: Verify one query can be selected
SELECT query_id, name, mobile_number, message, status, source 
FROM queries 
LIMIT 1;

-- STEP 6: Test the REST API endpoint
-- Run this in your browser console or Postman:
-- GET https://YOUR_PROJECT.supabase.co/rest/v1/queries
-- Headers:
--   apikey: YOUR_ANON_KEY
--   Authorization: Bearer YOUR_ANON_KEY
