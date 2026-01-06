-- NUCLEAR OPTION: Drop ALL sales_stats functions regardless of signature
-- Run this ALONE first

DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop all get_daily_sales_stats functions
    FOR func_record IN 
        SELECT oid::regprocedure as func_signature
        FROM pg_proc 
        WHERE proname = 'get_daily_sales_stats'
    LOOP
        EXECUTE 'DROP FUNCTION ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', func_record.func_signature;
    END LOOP;
    
    -- Find and drop all get_weekly_sales_stats functions
    FOR func_record IN 
        SELECT oid::regprocedure as func_signature
        FROM pg_proc 
        WHERE proname = 'get_weekly_sales_stats'
    LOOP
        EXECUTE 'DROP FUNCTION ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', func_record.func_signature;
    END LOOP;
END $$;

-- Verify all are gone
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%sales_stats%';
