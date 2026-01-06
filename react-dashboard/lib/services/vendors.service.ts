import { supabase } from '@/lib/supabase';
import type { Vendor } from '@/types/vendors';

export const vendorsService = {
    /**
     * Fetch all vendors
     */
    async fetchVendors(): Promise<Vendor[]> {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return [];
        }
    },
};
