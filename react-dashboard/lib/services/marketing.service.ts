import type { Coupon, Affiliate, Campaign, ReferralLog, CouponValidationResult } from '@/types/marketing';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class MarketingService {
    /**
     * Coupons
     */
    async fetchCoupons(): Promise<{ data: Coupon[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/coupons?order=created_at.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch coupons' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching coupons:', error);
            return { data: [], error: String(error) };
        }
    }

    async addCoupon(coupon: Partial<Coupon>): Promise<{ success: boolean; data?: Coupon; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/coupons`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(coupon),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add coupon' };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding coupon:', error);
            return { success: false, error: String(error) };
        }
    }

    async updateCoupon(id: string, updates: Partial<Coupon>): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/coupons?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update coupon' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating coupon:', error);
            return { success: false, error: String(error) };
        }
    }

    async deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/coupons?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to delete coupon' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting coupon:', error);
            return { success: false, error: String(error) };
        }
    }

    async validateCoupon(code: string, cartTotal: number): Promise<CouponValidationResult> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/validate-coupon`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                    body: JSON.stringify({ code, cartTotal }),
                }
            );

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error validating coupon:', error);
            return { valid: false, reason: 'Validation error' };
        }
    }

    /**
     * Affiliates
     */
    async fetchAffiliates(): Promise<{ data: Affiliate[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/affiliates?order=created_at.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch affiliates' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching affiliates:', error);
            return { data: [], error: String(error) };
        }
    }

    async addAffiliate(affiliate: Partial<Affiliate>): Promise<{ success: boolean; data?: Affiliate; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/affiliates`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(affiliate),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add affiliate' };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding affiliate:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Campaigns
     */
    async fetchCampaigns(): Promise<{ data: Campaign[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/campaigns?order=created_at.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch campaigns' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return { data: [], error: String(error) };
        }
    }

    async addCampaign(campaign: Partial<Campaign>): Promise<{ success: boolean; data?: Campaign; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/campaigns`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(campaign),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add campaign' };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding campaign:', error);
            return { success: false, error: String(error) };
        }
    }

    async sendCampaign(campaignId: string): Promise<{ success: boolean; sent?: number; failed?: number; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/send-campaign`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                    body: JSON.stringify({ campaignId }),
                }
            );

            const result = await response.json();
            return {
                success: result.success,
                sent: result.sentCount,
                failed: result.failedCount,
                error: result.error,
            };
        } catch (error) {
            console.error('Error sending campaign:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Referral Logs
     */
    async fetchReferralLogs(affiliateId?: string): Promise<{ data: ReferralLog[]; error?: string }> {
        try {
            let url = `${SUPABASE_URL}/rest/v1/referral_logs?order=created_at.desc`;
            if (affiliateId) {
                url += `&affiliate_id=eq.${affiliateId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                },
            });

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch referral logs' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching referral logs:', error);
            return { data: [], error: String(error) };
        }
    }
}

export const marketingService = new MarketingService();
