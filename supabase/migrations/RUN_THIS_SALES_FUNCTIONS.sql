-- Dashboard Analytics Functions - Run this entire block together
-- Drop ALL versions of existing functions
DROP FUNCTION IF EXISTS get_daily_sales_stats CASCADE;
DROP FUNCTION IF EXISTS get_weekly_sales_stats CASCADE;

-- Create daily sales stats function
CREATE FUNCTION get_daily_sales_stats(
    p_target_date DATE DEFAULT CURRENT_DATE,
    p_dsource_filter TEXT DEFAULT 'All'
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
        p_target_date AS target_date,
        COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_sales,
        COUNT(o.order_id)::BIGINT AS order_count,
        CASE 
            WHEN COUNT(o.order_id) > 0 THEN (SUM(o.total_amount) / COUNT(o.order_id))::NUMERIC
            ELSE 0::NUMERIC
        END AS average_order_value
    FROM orders o
    WHERE DATE(o.created_at) = p_target_date
        AND (p_dsource_filter = 'All' OR o.source = p_dsource_filter)
        AND o.order_status != 'cancelled';
END;
$$;

-- Create weekly sales stats function
CREATE FUNCTION get_weekly_sales_stats(
    p_target_date DATE DEFAULT CURRENT_DATE
)
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
    -- Get start of the week containing the target date (Monday)
    start_of_week := DATE_TRUNC('week', p_target_date)::DATE;
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
            DATE(o.created_at) AS order_date,
            SUM(o.total_amount) AS total_sales,
            COUNT(o.order_id) AS order_count
        FROM orders o
        WHERE DATE(o.created_at) >= start_of_week
            AND DATE(o.created_at) <= end_of_week
            AND o.order_status != 'cancelled'
        GROUP BY DATE(o.created_at)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_daily_sales_stats TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_weekly_sales_stats TO authenticated, anon;
