-- Comprehensive test script for dashboard analytics functions
-- Run each section separately to verify the data pipeline

-- ============================================
-- SECTION 1: Verify Functions Exist
-- ============================================
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    pronargs as num_args
FROM pg_proc 
WHERE proname IN ('get_daily_sales_stats', 'get_weekly_sales_stats')
ORDER BY proname, arguments;

-- Expected: 2 functions
-- get_daily_sales_stats(p_target_date date DEFAULT CURRENT_DATE, p_dsource_filter text DEFAULT 'All'::text)
-- get_weekly_sales_stats(p_target_date date DEFAULT CURRENT_DATE)


-- ============================================
-- SECTION 2: Test Daily Stats Function
-- ============================================
-- Test with Dec 23, 2025 (we know this has data)
SELECT * FROM get_daily_sales_stats('2025-12-23'::DATE, 'All');

-- Expected output should show:
-- target_date   | total_sales | order_count | average_order_value
-- 2025-12-23    | 50625.00    | 51          | ~993


-- ============================================
-- SECTION 3: Test Weekly Stats Function  
-- ============================================
-- Test with Dec 23, 2025 (should return Mon Dec 20 - Sun Dec 26)
SELECT * FROM get_weekly_sales_stats('2025-12-23'::DATE);

-- Expected: 7 rows (one for each day Mon-Sun)
-- Each row should have: week_start, week_end, total_sales, order_count


-- ============================================
-- SECTION 4: Test Different Dates
-- ============================================
-- Test with Dec 24, 2025
SELECT * FROM get_daily_sales_stats('2025-12-24'::DATE, 'All');

-- Expected: 56 orders, 57766 sales

-- Test weekly for Dec 24
SELECT * FROM get_weekly_sales_stats('2025-12-24'::DATE);

-- Expected: Same week as Dec 23 (Mon Dec 20 - Sun Dec 26)


-- ============================================
-- SECTION 5: Test Source Filter
-- ============================================
-- Test with different sources (if you have them)
SELECT * FROM get_daily_sales_stats('2025-12-23'::DATE, 'Website');
SELECT * FROM get_daily_sales_stats('2025-12-23'::DATE, 'WhatsApp');


-- ============================================
-- SECTION 6: Performance Check
-- ============================================
-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM get_weekly_sales_stats('2025-12-23'::DATE);

-- Should complete in < 100ms for reasonable data sizes


-- ============================================
-- SECTION 7: Edge Cases
-- ============================================
-- Test with date that has no data (should return 0s)
SELECT * FROM get_daily_sales_stats('2026-01-05'::DATE, 'All');

-- Expected: total_sales = 0, order_count = 0

-- Test weekly for current week (should return 7 rows with 0s)
SELECT * FROM get_weekly_sales_stats('2026-01-05'::DATE);


-- ============================================
-- SECTION 8: Verify Permissions
-- ============================================
-- Check that functions are accessible
SELECT 
    proname,
    proacl
FROM pg_proc 
WHERE proname IN ('get_daily_sales_stats', 'get_weekly_sales_stats');

-- Expected: Should have EXECUTE granted to authenticated, anon
