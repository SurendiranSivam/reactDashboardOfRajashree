-- Migration: Add Dashboard Analytics Functions
-- Created: 2026-01-05
-- Description: Creates RPC functions for dashboard sales and order statistics

-- Drop existing functions if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS get_daily_sales_stats(DATE, TEXT);
DROP FUNCTION IF EXISTS get_weekly_sales_stats();

-- Function 1: Get Daily Sales Stats
CREATE OR REPLACE FUNCTION get_daily_sales_stats(
    target_date DATE DEFAULT CURRENT_DATE,
    dsource_filter TEXT DEFAULT 'All'
)
RETURNS TABLE (
    target_date DATE,
    total_sales NUMERIC,
    order_count BIGINT,
    average_order_value NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        target_date AS target_date,
        COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_sales,
        COUNT(o.order_id)::BIGINT AS order_count,
        CASE 
            WHEN COUNT(o.order_id) > 0 THEN (SUM(o.total_amount) / COUNT(o.order_id))::NUMERIC
            ELSE 0::NUMERIC
        END AS average_order_value
    FROM orders o
    WHERE DATE(o.order_date) = target_date
        AND (dsource_filter = 'All' OR o.order_source = dsource_filter)
        AND o.status != 'cancelled';
END;
$$;

-- Function 2: Get Weekly Sales Stats
CREATE OR REPLACE FUNCTION get_weekly_sales_stats()
RETURNS TABLE (
    week_start DATE,
    week_end DATE,
    total_sales NUMERIC,
    order_count BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    start_of_week DATE;
    end_of_week DATE;
BEGIN
    -- Get start of current week (Monday)
    start_of_week := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    end_of_week := start_of_week + INTERVAL '6 days';
    
    RETURN QUERY
    WITH RECURSIVE dates AS (
        SELECT start_of_week AS date
        UNION ALL
        SELECT (date + INTERVAL '1 day')::DATE
        FROM dates
        WHERE date < end_of_week
    ),
    daily_stats AS (
        SELECT 
            DATE(o.order_date) AS order_date,
            SUM(o.total_amount) AS total_sales,
            COUNT(o.order_id) AS order_count
        FROM orders o
        WHERE DATE(o.order_date) >= start_of_week
            AND DATE(o.order_date) <= end_of_week
            AND o.status != 'cancelled'
        GROUP BY DATE(o.order_date)
    )
    SELECT 
        d.date AS week_start,
        d.date AS week_end,
        COALESCE(ds.total_sales, 0)::NUMERIC AS total_sales,
        COALESCE(ds.order_count, 0)::BIGINT AS order_count
    FROM dates d
    LEFT JOIN daily_stats ds ON d.date = ds.order_date
    ORDER BY d.date;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_daily_sales_stats TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_weekly_sales_stats TO authenticated, anon;

-- Add helpful comment
COMMENT ON FUNCTION get_daily_sales_stats IS 'Returns sales statistics for a specific date with optional source filter';
COMMENT ON FUNCTION get_weekly_sales_stats IS 'Returns daily sales statistics for the current week (Monday to Sunday)';
