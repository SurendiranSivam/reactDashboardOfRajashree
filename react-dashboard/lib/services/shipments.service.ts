import { supabase } from '@/lib/supabase';
import type { Shipment } from '@/types/shipments';

export const shipmentsService = {
  /**
   * Fetch all shipments with order and customer data
   */
  async fetchShipments(): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          orders (
            order_id,
            total_amount,
            customers (
              full_name,
              mobile_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Shipments fetch error:', error);
        // Fallback without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching shipments:', error);
      return [];
    }
  },
};
