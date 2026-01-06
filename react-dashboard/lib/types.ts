// Query/Ticket Types
export interface Query {
    query_id: number;
    name: string;
    email: string | null;
    mobile_number: string;
    message: string;
    source: 'Web' | 'WhatsApp';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    order_id: string | null;
    order_date: string | null;
    customer_email: string | null;
    created_at: string;
    remarks: string | null;
}

export interface QueryMessage {
    message_id: number;
    query_id: number;
    sender_type: 'customer' | 'admin';
    message: string;
    sent_at: string;
    delivered: boolean;
}

// Order Types
export interface Order {
    order_id: string;
    customer_name: string;
    email: string;
    phone: string;
    total_amount: number;
    payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    order_status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    created_at: string;
    updated_at: string;
}

// Customer Types
export interface Customer {
    customer_id: number;
    name: string;
    email: string;
    phone: string;
    total_orders: number;
    last_order_date: string | null;
    status: 'Active' | 'Inactive';
    created_at: string;
}

// Product Types
export interface Product {
    product_id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    image_url: string | null;
    status: 'Active' | 'Inactive';
    created_at: string;
}

// Vendor Types
export interface Vendor {
    vendor_id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
    created_at: string;
}

// Shipment Types
export interface Shipment {
    shipment_id: number;
    order_id: string;
    tracking_number: string;
    courier: string;
    status: 'Pending' | 'In Transit' | 'Delivered' | 'Failed';
    shipped_date: string | null;
    delivered_date: string | null;
    created_at: string;
}

// Return Types
export interface Return {
    return_id: number;
    order_id: string;
    customer_name: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    refund_amount: number;
    created_at: string;
}

// Filter Types
export interface QueryFilters {
    status?: string;
    priority?: string;
    source?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface OrderFilters {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}
