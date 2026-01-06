import type { Return } from '@/types/returns';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class ReturnsService {
    /**
     * Fetch all returns
     */
    async fetchReturns(): Promise<{ data: Return[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/returns?order=return_date.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch returns' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching returns:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Add new return
     */
    async addReturn(returnData: Return): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/returns`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({
                        order_id: returnData.order_id,
                        return_date: returnData.return_date || new Date().toISOString(),
                        status: returnData.status,
                        reason: returnData.reason,
                        returned_items: returnData.returned_items,
                        refund_amount: returnData.refund_amount,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add return' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding return:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update return status
     */
    async updateStatus(returnId: number, status: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/returns?return_id=eq.${returnId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update status' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating status:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update return details
     */
    async updateReturnDetails(
        returnId: number,
        updates: { status?: string; reason?: string; returned_items?: string }
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/returns?return_id=eq.${returnId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...updates,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update return' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating return:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Delete return
     */
    async deleteReturn(returnId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/returns?return_id=eq.${returnId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to delete return' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting return:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const returnsService = new ReturnsService();
