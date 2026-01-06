import { supabase } from '@/lib/supabase';
import type { Product, ProductVariant } from '@/types/products';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const productsService = {
    /**
     * Fetch products using Edge Function (MATCHING FLUTTER)
     * Flutter uses: /functions/v1/get-product-with-variants
     */
    async fetchProductsViaEdgeFunction(page: number = 1, limit: number = 100, search?: string): Promise<{
        data: Product[];
        total: number;
    }> {
        try {
            console.log('📡 Fetching via Edge Function (matching Flutter)...');

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.append('search', search);

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/get-product-with-variants?${params}`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                console.error('Edge Function failed:', response.status, response.statusText);
                throw new Error(`Edge Function failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ Edge Function success! Products: ${result.data?.length || 0}`);

            return {
                data: result.data || [],
                total: result.total || 0,
            };
        } catch (error) {
            console.error('Error calling Edge Function:', error);
            return { data: [], total: 0 };
        }
    },

    /**
     * Fetch all products (simple query)
     */
    async fetchProducts(): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('product_name', { ascending: true });

            if (error) {
                console.error('Products fetch error:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },

    /**
     * Fetch product variants - Manual method (fetch separately and join)
     * This is Flutter's fallback when Edge Function is not available
     */
    async fetchProductVariantsManual(): Promise<ProductVariant[]> {
        try {
            console.log('🔧 Fetching with manual join (Flutter fallback method)...');

            // Step 1: Get all variants
            const { data: variants, error: variantsError } = await supabase
                .from('product_variants')
                .select('*');

            if (variantsError) {
                console.error('Variants fetch error:', variantsError);
                return [];
            }

            if (!variants || variants.length === 0) {
                console.log('⚠️ No product variants found');
                return [];
            }

            // Step 2: Get all products  
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*');

            if (productsError) {
                console.error('Products fetch error:', productsError);
                // Return variants without product details
                return variants;
            }

            // Step 3: Manual join (matching Flutter logic)
            const variantsWithProducts = variants.map(variant => ({
                ...variant,
                products: products?.find(p => p.product_id === variant.product_id) || null
            }));

            console.log(`✅ Manual join succeeded! ${variantsWithProducts.length} variants`);
            return variantsWithProducts;
        } catch (error) {
            console.error('Error in manual join:', error);
            return [];
        }
    },

    /**
     * Fetch product variants with automatic join (Supabase method)
     */
    async fetchProductVariants(): Promise<ProductVariant[]> {
        try {
            console.log('🔍 Fetching product variants with join...');

            const { data, error } = await supabase
                .from('product_variants')
                .select(`
          *,
          products (
            product_id,
            product_name,
            sku_prefix,
            category
          )
        `);

            if (error) {
                console.error('❌ Join query failed:', error.message);
                // Fallback to manual join (Flutter method)
                return this.fetchProductVariantsManual();
            }

            console.log(`✅ Join query succeeded! Found ${data?.length || 0} variants`);
            return data || [];
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            // Final fallback
            return this.fetchProductVariantsManual();
        }
    },
};
