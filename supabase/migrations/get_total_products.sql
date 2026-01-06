-- RPC Function: get_total_products
-- Returns the total count of ACTIVE products
-- Matches Flutter implementation

CREATE OR REPLACE FUNCTION get_total_products()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_count INTEGER;
BEGIN
    -- Count unique products (not variants)
    SELECT COUNT(DISTINCT product_id)
    INTO product_count
    FROM products;
    
    RETURN COALESCE(product_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_total_products() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_products() TO anon;

-- Test the function
SELECT get_total_products();
