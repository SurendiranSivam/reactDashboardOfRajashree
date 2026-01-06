export interface Customer {
    customer_id: string;
    full_name: string;
    mobile_number: string;
    email: string;
}

export interface ProductVariant {
    sku: string;
    variant_name: string;
    saleprice: number;
}

export interface OrderItem {
    order_item_id: string;
    order_id: string;
    product_variant_id: string;
    quantity: number;
    product_variants?: ProductVariant;
}

export interface Order {
    order_id: string;
    customer_id: string;
    created_at: string;
    total_amount: number;
    shipping_amount: number;
    source: string;
    order_status: string;
    shipment_status: string | null;
    invoice_url: string | null;
    payment_transaction_id: string | null;
    payment_method: string;
    order_note: string;
    name: string;
    contact_number: string;
    shipping_address: string;
    shipping_state: string;
    order_date: string;

    // Joined data
    customers?: Customer;
    order_items?: OrderItem[];
}

export interface SkuSummary {
    sku: string;
    variant_name: string;
    total_qty: number;
    current_stock: number;
    saleprice: number;
}
