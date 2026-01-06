-- Quick test to check orders table structure and find correct column names
-- Run this in Supabase SQL Editor

-- Check what columns exist in orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
