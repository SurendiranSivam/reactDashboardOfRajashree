import { supabase } from '@/lib/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface DailySalesStats {
    target_date: string;
    total_sales: number;
    order_count: number;
    average_order_value: number;
}

export interface WeeklySalesStats {
    week_start: string;
    week_end: string;
    total_sales: number;
    order_count: number;
}

export const dashboardService = {
    /**
     * Get daily sales stats (RPC)
     */
    async getDailySalesStats(date: Date, dsourceFilter: string = 'All'): Promise<DailySalesStats | null> {
        try {
            const targetDate = date.toISOString().split('T')[0];

            console.log('[DashboardService] getDailySalesStats called', {
                targetDate,
                dsourceFilter,
                timestamp: new Date().toISOString()
            });

            const startTime = Date.now();
            const { data, error } = await supabase.rpc('get_daily_sales_stats', {
                p_target_date: targetDate,
                p_dsource_filter: dsourceFilter,
            });
            const duration = Date.now() - startTime;

            if (error) {
                console.error('[DashboardService] getDailySalesStats error', {
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    targetDate,
                    dsourceFilter
                });
                throw error;
            }

            const stats = data as DailySalesStats[];
            const result = stats && stats.length > 0 ? stats[0] : null;

            console.log('[DashboardService] getDailySalesStats success', {
                duration: `${duration}ms`,
                hasData: !!result,
                totalSales: result?.total_sales || 0,
                orderCount: result?.order_count || 0,
                targetDate
            });

            return result;
        } catch (error) {
            console.error('[DashboardService] getDailySalesStats fatal error:', error);
            return null;
        }
    },

    /**
     * Get weekly sales stats (RPC)
     */
    async getWeeklySalesStats(date: Date = new Date()): Promise<WeeklySalesStats[]> {
        try {
            const targetDate = date.toISOString().split('T')[0];

            console.log('[DashboardService] getWeeklySalesStats called', {
                targetDate,
                timestamp: new Date().toISOString()
            });

            const startTime = Date.now();
            const { data, error } = await supabase.rpc('get_weekly_sales_stats', {
                p_target_date: targetDate
            });
            const duration = Date.now() - startTime;

            if (error) {
                console.error('[DashboardService] getWeeklySalesStats error', {
                    error: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    targetDate
                });
                throw error;
            }

            const result = (data as WeeklySalesStats[]) || [];

            console.log('[DashboardService] getWeeklySalesStats success', {
                duration: `${duration}ms`,
                rows: result.length,
                totalSales: result.reduce((sum, day) => sum + (day.total_sales || 0), 0),
                totalOrders: result.reduce((sum, day) => sum + (day.order_count || 0), 0),
                dateRange: result.length > 0 ? `${result[0].week_start} to ${result[result.length - 1].week_end}` : 'none'
            });

            return result;
        } catch (error) {
            console.error('[DashboardService] getWeeklySalesStats fatal error:', error);
            return [];
        }
    },

    /**
     * Get total orders count from Orders Edge Function
     */
    async getTotalOrders(): Promise<number> {
        try {
            console.log('📡 Fetching orders count via Edge Function...');

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/getOrderWithItems?limit=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Edge Function failed');

            const result = await response.json();
            const total = result.total || result.orders?.length || 0;

            console.log(`✅ Orders count from Edge Function: ${total}`);
            return total;
        } catch (error) {
            console.error('Error fetching orders count:', error);

            // Fallback
            try {
                const { count } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                return count || 0;
            } catch (fallbackError) {
                return 0;
            }
        }
    },

    /**
     * Get total customers count (REST API)
     */
    async getTotalCustomers(): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error fetching total customers:', error);
            return 0;
        }
    },

    /**
     * Get total products count from Products Edge Function
     */
    async getTotalProducts(): Promise<number> {
        try {
            console.log('📡 Fetching product count via Edge Function...');

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/get-product-with-variants?page=1&limit=1`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Edge Function failed');

            const result = await response.json();
            const total = result.total || 0;

            console.log(`✅ Product count from Edge Function: ${total}`);
            return total;
        } catch (error) {
            console.error('Error fetching total products:', error);

            // Fallback
            try {
                const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                return count || 0;
            } catch (fallbackError) {
                return 0;
            }
        }
    },
};
