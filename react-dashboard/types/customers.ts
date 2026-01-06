export interface Customer {
    customer_id: string;
    full_name: string;
    mobile_number: string;
    email: string;
    state: string | null;
    created_at: string;
    pincode: string | null;
    address: string | null;
}
