-- Check actual product count in database
-- Using CORRECT table names from schema

-- 1. Total products in master_product table
SELECT COUNT(*) as total_products FROM master_product;

-- 2. Total active products
SELECT COUNT(*) as active_products FROM master_product WHERE is_active = true;

-- 3. Total variants
SELECT COUNT(*) as total_variants FROM product_variants;

-- 4. Total active variants
SELECT COUNT(*) as active_variants FROM product_variants WHERE is_active = true;

-- 5. Products with their variant counts
SELECT 
    p.product_id,
    p.name as product_name,
    p.sku,
    p.is_active,
    COUNT(v.variant_id) as variant_count
FROM master_product p
LEFT JOIN product_variants v ON p.product_id = v.product_id
GROUP BY p.product_id, p.name, p.sku, p.is_active
ORDER BY p.product_id
LIMIT 10;

-- 6. SUMMARY: Products and Variants
SELECT 
    (SELECT COUNT(*) FROM master_product) as total_products,
    (SELECT COUNT(*) FROM master_product WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM product_variants) as total_variants,
    (SELECT COUNT(*) FROM product_variants WHERE is_active = true) as active_variants;
