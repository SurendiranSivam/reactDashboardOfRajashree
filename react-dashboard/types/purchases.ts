// Purchase Types (matching Flutter's purchase_model.dart)

export interface PurchaseItem {
    purchase_item_id?: number;
    purchase_id?: number;
    variant_id: number;
    quantity: number;
    cost_price: number;
    variant?: {
        variant_id: number;
        variant_name: string;
        sku: string;
        product_name?: string;
    };
}

export interface Purchase {
    purchase_id?: number;
    invoice_no: string;
    invoice_date: string;
    invoice_image?: string;
    vendor_id: number;
    vendor?: {
        vendor_id: number;
        name: string;
        contact_number?: string;
        gst?: string;
    };
    amount: number;
    purchase_date?: string;
    payment_status?: 'Paid' | 'Pending';
    items: PurchaseItem[];
}
