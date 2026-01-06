-- Quick check: Do we have any orders with data?
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_sales,
    MIN(created_at) as oldest_order,
    MAX(created_at) as newest_order
FROM orders
WHERE order_status != 'cancelled';

-- Check today's data
SELECT 
    COUNT(*) as today_orders,
    SUM(total_amount) as today_sales
FROM orders
WHERE DATE(created_at) = CURRENT_DATE
    AND order_status != 'cancelled';

-- Check this week's data
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as orders,
    SUM(total_amount) as sales
FROM orders
WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
    AND order_status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date;
