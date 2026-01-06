import type { Vendor } from '@/types/vendors';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class VendorsApiService {
    /**
     * Fetch all vendors
     */
    async fetchVendors(): Promise<{ data: Vendor[]; total: number }> {
        try {
            console.log('📡 Fetching vendors...');

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/get-vendors`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Fetch vendors failed:', errorData);
                return { data: [], total: 0 };
            }

            const result = await response.json();
            console.log('✅ Vendors fetched:', result);

            return {
                data: result.vendors || result.data || [],
                total: result.total || (result.vendors?.length || 0)
            };
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return { data: [], total: 0 };
        }
    }

    /**
     * Add new vendor
     */
    async addVendor(vendorData: Vendor): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📤 Adding vendor:', vendorData);

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/create-vendor`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(vendorData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Add vendor failed:', errorData);
                return { success: false, error: errorData.error || response.statusText };
            }

            const result = await response.json();
            console.log('✅ Vendor added successfully:', result);
            return { success: true };
        } catch (error) {
            console.error('❌ Add Vendor Error:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update vendor
     */
    async updateVendor(vendorId: number, vendorData: Partial<Vendor>): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📝 Updating vendor:', vendorId, vendorData);

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/update-vendor`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ vendor_id: vendorId, ...vendorData }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Update vendor failed:', errorData);
                return { success: false, error: errorData.error || response.statusText };
            }

            console.log('✅ Vendor updated successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Update Vendor Error:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Delete vendor
     */
    async deleteVendor(vendorId: number): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('🗑️ Deleting vendor:', vendorId);

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/delete-vendor`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ vendor_id: vendorId }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Delete vendor failed:', errorData);
                return { success: false, error: errorData.error || response.statusText };
            }

            console.log('✅ Vendor deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Delete Vendor Error:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const vendorsApiService = new VendorsApiService();
