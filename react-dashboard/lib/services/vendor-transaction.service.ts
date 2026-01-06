import type { VendorTransaction, UnpaidInvoice } from '@/types/vendor-transactions';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class VendorTransactionService {
    /**
     * Fetch all transactions for a vendor (matching Flutter lines 22)
     */
    async fetchVendorTransactions(vendorId: number): Promise<{ data: VendorTransaction[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_transactions?vendor_id=eq.${vendorId}&order=transaction_date.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch transactions' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching vendor transactions:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Fetch unpaid invoices for a vendor (matching Flutter lines 40-41)
     */
    async fetchUnpaidInvoices(vendorId: number): Promise<{ data: UnpaidInvoice[]; error?: string }> {
        try {
            // Query to get purchases with their total paid amount from vendor_transactions
            const purchasesResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/purchase?vendor_id=eq.${vendorId}&select=purchase_id,invoice_no,amount`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!purchasesResponse.ok) {
                return { data: [], error: 'Failed to fetch purchases' };
            }

            const purchases = await purchasesResponse.json();

            // Get all transactions for this vendor
            const transactionsResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_transactions?vendor_id=eq.${vendorId}&select=purchase_id,amount_paid`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            const transactions = await transactionsResponse.json();

            // Calculate paid and balance for each purchase
            const unpaidInvoices: UnpaidInvoice[] = purchases.map((purchase: any) => {
                const paid = transactions
                    .filter((t: any) => t.purchase_id === purchase.purchase_id)
                    .reduce((sum: number, t: any) => sum + (t.amount_paid || 0), 0);

                const balance = purchase.amount - paid;

                return {
                    purchase_id: purchase.purchase_id,
                    invoice_no: purchase.invoice_no,
                    amount: purchase.amount,
                    paid,
                    balance,
                };
            }).filter((inv: UnpaidInvoice) => inv.balance > 0); // Only unpaid invoices

            return { data: unpaidInvoices };
        } catch (error) {
            console.error('Error fetching unpaid invoices:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Add vendor transaction (matching Flutter lines 194-196)
     */
    async addVendorTransaction(transaction: VendorTransaction): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_transactions`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({
                        vendor_id: transaction.vendor_id,
                        purchase_id: transaction.purchase_id,
                        amount_paid: transaction.amount_paid,
                        balance_amount: transaction.balance_amount,
                        transaction_date: transaction.transaction_date,
                        comment: transaction.comment,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add transaction' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding vendor transaction:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Toggle vendor active status (matching Flutter lines 246-249)
     */
    async toggleVendorStatus(vendorId: number, isActive: boolean): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor?vendor_id=eq.${vendorId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        is_active: isActive,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update vendor status' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating vendor status:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const vendorTransactionService = new VendorTransactionService();
