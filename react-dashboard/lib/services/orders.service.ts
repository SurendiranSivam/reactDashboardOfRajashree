import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, SkuSummary } from '@/types/orders';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const ordersService = {
    /**
     * Fetch all orders using Edge Function (MATCHING FLUTTER EXACTLY)
     * Flutter uses: /functions/v1/getOrderWithItems
     */
    async fetchOrders(search?: string, filter?: string): Promise<{ orders: Order[], total: number }> {
        try {
            console.log('📡 Fetching orders via Edge Function (matching Flutter)...');

            const params = new URLSearchParams({
                limit: '10000'
            });

            if (search) params.append('search', search);
            if (filter) params.append('filter', filter);

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/getOrderWithItems?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                console.error('Edge Function failed:', response.status);
                throw new Error(`Edge Function failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Orders Edge Function returned ${data.orders?.length || 0} orders`);

            return {
                orders: data.orders || [],
                total: data.total || data.orders?.length || 0
            };
        } catch (error) {
            console.error('Error calling Orders Edge Function:', error);

            // Fallback to direct query
            console.log('⚠️ Trying fallback query...');
            try {
                const { data, error: fallbackError } = await supabase
                    .from('orders')
                    .select(`
            *,
            customers (
              customer_id,
              full_name,
              mobile_number,
              email
            )
          `)
                    .order('created_at', { ascending: false });

                if (fallbackError) throw fallbackError;

                return {
                    orders: (data || []).map(order => ({
                        ...order,
                        order_date: order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A',
                    })),
                    total: data?.length || 0
                };
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return { orders: [], total: 0 };
            }
        }
    },

    /**
     * Fetch order items for a specific order (MATCHING FLUTTER)
     */
    async fetchOrderItems(orderId: string): Promise<OrderItem[]> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/getOrderWithItems?orderId=${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch order items');

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching order items:', error);

            // Fallback
            try {
                const { data, error: fallbackError } = await supabase
                    .from('order_items')
                    .select(`
            *,
            product_variants (
              sku,
              variant_name,
              saleprice
            )
          `)
                    .eq('order_id', orderId);

                if (fallbackError) throw fallbackError;
                return data || [];
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
                return [];
            }
        }
    },

    /**
     * Fetch complete order JSON for invoice generation (MATCHING FLUTTER)
     */
    async fetchOrderJson(orderId: string): Promise<any> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/generateinvoice?order_id=${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch order JSON');
            return await response.json();
        } catch (error) {
            console.error('Error fetching order JSON:', error);
            return null;
        }
    },

    /**
     * Fetch SKU summary for a specific date (MATCHING FLUTTER)
     */
    async fetchDailySkuSummary(date: Date): Promise<SkuSummary[]> {
        try {
            const targetDate = date.toISOString().split('T')[0];

            const { data, error } = await supabase
                .rpc('daily_sku_summary_with_stock', {
                    p_date: targetDate,
                });

            if (error) {
                console.error('SKU summary fetch error:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Error fetching SKU summary:', error);
            return [];
        }
    },

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: status })
                .eq('order_id', orderId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            return false;
        }
    },
};
