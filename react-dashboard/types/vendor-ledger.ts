export interface VendorLedgerEntry {
    ledger_id?: number;
    vendor_id: number;
    transaction_date: string;
    transaction_type: 'DEBIT' | 'CREDIT';
    reference_type: 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT' | 'OPENING_BALANCE';
    reference_id?: number | null;
    debit_amount: number;
    credit_amount: number;
    running_balance: number;
    description?: string | null;
    invoice_no?: string | null;
    created_by?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface VendorBalance {
    vendor_id: number;
    name: string;
    current_balance: number;
    total_purchases: number;
    total_paid: number;
}

export interface PaymentRequest {
    vendor_id: number;
    amount: number;
    description?: string;
    purchase_id?: number | null; // If paying against specific invoice
    invoice_no?: string | null;
}

export interface PurchaseRecord {
    purchase_id: number;
    invoice_no: string;
    amount: number;
    invoice_date: string;
}
