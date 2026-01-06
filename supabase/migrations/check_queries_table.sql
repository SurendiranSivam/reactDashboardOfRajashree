-- Check queries table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'queries' 
ORDER BY ordinal_position;

-- Check if there's data
SELECT COUNT(*) as total_queries FROM queries;

-- Sample query record
SELECT * FROM queries LIMIT 1;
