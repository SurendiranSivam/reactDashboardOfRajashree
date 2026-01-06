import type { CallLog, ExecutiveAvailability, CallQueue, CallAnalytics, CallStatus, ExecutiveStatus } from '@/types/calls';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class CallsService {
    /**
     * Fetch all calls with optional filters
     */
    async fetchCalls(filters?: {
        executive_id?: number;
        status?: CallStatus;
        date?: string;
    }): Promise<{ data: CallLog[]; error?: string }> {
        try {
            let url = `${SUPABASE_URL}/rest/v1/call_logs?order=started_at.desc`;

            if (filters?.executive_id) {
                url += `&executive_id=eq.${filters.executive_id}`;
            }
            if (filters?.status) {
                url += `&status=eq.${filters.status}`;
            }
            if (filters?.date) {
                url += `&started_at=gte.${filters.date}`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                },
            });

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch calls' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching calls:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Fetch executive availability status
     */
    async fetchExecutiveAvailability(): Promise<{ data: ExecutiveAvailability[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/executive_availability?select=*,users(user_id,full_name,email)&order=updated_at.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch availability' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching availability:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Update executive status
     */
    async updateExecutiveStatus(executiveId: number, status: ExecutiveStatus): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/executive_availability?executive_id=eq.${executiveId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
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
     * Fetch call queue
     */
    async fetchCallQueue(): Promise<{ data: CallQueue[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/call_queue?status=eq.waiting&order=queued_at.asc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch queue' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching queue:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Fetch call analytics
     */
    async fetchCallAnalytics(days: number = 7): Promise<{ data: CallAnalytics[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/call_analytics?order=call_date.desc&limit=${days}`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch analytics' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Get call statistics for today
     */
    async getTodayStats(): Promise<{
        total: number;
        answered: number;
        missed: number;
        avgDuration: number;
    }> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await this.fetchCalls({ date: today });

            const total = data.length;
            const answered = data.filter(c => c.status === 'completed').length;
            const missed = data.filter(c => c.status === 'no-answer').length;
            const avgDuration = data.reduce((sum, c) => sum + (c.duration || 0), 0) / (answered || 1);

            return { total, answered, missed, avgDuration };
        } catch (error) {
            return { total: 0, answered: 0, missed: 0, avgDuration: 0 };
        }
    }
}

export const callsService = new CallsService();
