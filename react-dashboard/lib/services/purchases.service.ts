import { supabase } from '@/lib/supabase';
import type { Purchase } from '@/types/purchases';

export const purchasesService = {
    /**
     * Fetch all purchases with vendor + items + product_variants (MATCHING FLUTTER)
     * Flutter query: /rest/v1/purchase?select=*,vendor(*),purchase_items(*,product_variants(*))
     */
    async fetchPurchases(): Promise<Purchase[]> {
        try {
            console.log('📡 Fetching purchases with joins (matching Flutter)...');

            const { data, error } = await supabase
                .from('purchase')
                .select(`
          *,
          vendor (
            vendor_id,
            vendor_name,
            contact_person,
            mobile_number
          ),
          purchase_items (
            *,
            product_variants (
              sku,
              variant_name,
              cost_price,
              stock_quantity
            )
          )
        `)
                .order('invoice_date', { ascending: false });

            if (error) {
                console.error('❌ Purchases fetch error:', error);

                // Fallback: Try without joins
                console.log('⚠️ Trying fallback without joins...');
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('purchase')
                    .select('*')
                    .order('invoice_date', { ascending: false });

                if (fallbackError) throw fallbackError;
                console.log(`✅ Fallback succeeded: ${fallbackData?.length || 0} purchases`);
                return fallbackData || [];
            }

            console.log(`✅ Fetched ${data?.length || 0} purchases with full joins`);
            return data || [];
        } catch (error) {
            console.error('Error fetching purchases:', error);
            return [];
        }
    },
};
