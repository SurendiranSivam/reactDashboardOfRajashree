export interface Product {
    id?: string;
    product_id?: string;
    name?: string;
    product_name?: string;
    sku?: string;
    sku_prefix?: string;
    category?: string;
    subcategoryName?: string;
    imageUrl?: string;
    created_at?: string;
    updated_at?: string;

    // Variants array (from Edge Function)
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id?: string;
    variant_id?: string;
    product_id?: string;
    sku?: string;
    name?: string;
    variant_name?: string;
    color?: string | null;
    size?: string | null;

    // Stock fields
    stock?: number;
    stock_quantity?: number;

    // Price fields (different naming conventions)
    cost_price?: number;
    costPrice?: number;
    regularPrice?: number;
    saleprice?: number;
    salePrice?: number;
    mrp?: number;

    // Other fields
    weight?: number | null;
    isActive?: boolean;
    created_at?: string;

    // Joined product data
    products?: Product;
}
