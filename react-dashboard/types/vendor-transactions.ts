export interface VendorTransaction {
    transaction_id?: number;
    vendor_id: number;
    purchase_id?: number | null;
    amount_paid: number;
    balance_amount: number;
    transaction_date: string;
    comment?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UnpaidInvoice {
    purchase_id: number;
    invoice_no: string;
    amount: number;
    paid: number;
    balance: number;
}
