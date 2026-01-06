import type { VendorLedgerEntry, VendorBalance, PaymentRequest, PurchaseRecord } from '@/types/vendor-ledger';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class VendorLedgerService {
    /**
     * Fetch complete ledger for a vendor
     */
    async fetchVendorLedger(vendorId: number): Promise<{ data: VendorLedgerEntry[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_ledger?vendor_id=eq.${vendorId}&order=transaction_date.desc,ledger_id.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch ledger' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching vendor ledger:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Get vendor balance summary
     */
    async getVendorBalance(vendorId: number): Promise<{ data: VendorBalance | null; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_balances?vendor_id=eq.${vendorId}`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: null, error: 'Failed to fetch balance' };
            }

            const data = await response.json();
            return { data: data[0] || null };
        } catch (error) {
            console.error('Error fetching vendor balance:', error);
            return { data: null, error: String(error) };
        }
    }

    /**
     * Record a purchase (creates DEBIT entry)
     * Called automatically when purchase is created
     */
    async recordPurchase(purchase: PurchaseRecord, vendorId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const ledgerEntry: Partial<VendorLedgerEntry> = {
                vendor_id: vendorId,
                transaction_date: purchase.invoice_date,
                transaction_type: 'DEBIT',
                reference_type: 'PURCHASE',
                reference_id: purchase.purchase_id,
                debit_amount: purchase.amount,
                credit_amount: 0,
                description: `Purchase Invoice: ${purchase.invoice_no}`,
                invoice_no: purchase.invoice_no,
            };

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_ledger`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(ledgerEntry),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to record purchase' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error recording purchase:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Record a payment (creates CREDIT entry)
     */
    async recordPayment(payment: PaymentRequest): Promise<{ success: boolean; error?: string }> {
        try {
            let description = `Payment of ₹${payment.amount}`;
            if (payment.invoice_no) {
                description += ` against Invoice ${payment.invoice_no}`;
            }
            if (payment.description) {
                description += ` - ${payment.description}`;
            }

            const ledgerEntry: Partial<VendorLedgerEntry> = {
                vendor_id: payment.vendor_id,
                transaction_date: new Date().toISOString(),
                transaction_type: 'CREDIT',
                reference_type: 'PAYMENT',
                reference_id: payment.purchase_id,
                debit_amount: 0,
                credit_amount: payment.amount,
                description,
                invoice_no: payment.invoice_no,
            };

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_ledger`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(ledgerEntry),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to record payment' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error recording payment:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Record adjustment (DEBIT or CREDIT)
     */
    async recordAdjustment(
        vendorId: number,
        amount: number,
        type: 'DEBIT' | 'CREDIT',
        description: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const ledgerEntry: Partial<VendorLedgerEntry> = {
                vendor_id: vendorId,
                transaction_date: new Date().toISOString(),
                transaction_type: type,
                reference_type: 'ADJUSTMENT',
                debit_amount: type === 'DEBIT' ? amount : 0,
                credit_amount: type === 'CREDIT' ? amount : 0,
                description: `Adjustment: ${description}`,
            };

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/vendor_ledger`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(ledgerEntry),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to record adjustment' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error recording adjustment:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Get outstanding invoices (purchases with balance)
     */
    async getOutstandingInvoices(vendorId: number): Promise<{ data: any[]; error?: string }> {
        try {
            // Get all purchase invoices
            const purchasesResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/purchase?vendor_id=eq.${vendorId}&select=purchase_id,invoice_no,amount,invoice_date`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!purchasesResponse.ok) {
                return { data: [], error: 'Failed to fetch invoices' };
            }

            const purchases = await purchasesResponse.json();

            // Get payments for each invoice
            const invoicesWithBalance = await Promise.all(
                purchases.map(async (purchase: any) => {
                    const paymentsResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/vendor_ledger?vendor_id=eq.${vendorId}&reference_type=eq.PAYMENT&reference_id=eq.${purchase.purchase_id}`,
                        {
                            headers: {
                                'apikey': ANON_KEY,
                                'Authorization': `Bearer ${ANON_KEY}`,
                            },
                        }
                    );

                    const payments = await paymentsResponse.json();
                    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.credit_amount, 0);
                    const balance = purchase.amount - totalPaid;

                    return {
                        purchase_id: purchase.purchase_id,
                        invoice_no: purchase.invoice_no,
                        invoice_date: purchase.invoice_date,
                        total_amount: purchase.amount,
                        paid: totalPaid,
                        balance,
                    };
                })
            );

            // Return only outstanding invoices
            return { data: invoicesWithBalance.filter(inv => inv.balance > 0) };
        } catch (error) {
            console.error('Error fetching outstanding invoices:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Toggle vendor status
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

export const vendorLedgerService = new VendorLedgerService();
