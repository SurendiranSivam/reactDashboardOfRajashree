// Vendor Types (matching Flutter's vendor_model.dart)

export interface Vendor {
    vendor_id?: number;
    name: string;
    address: string;
    contact_number: string;
    gst: string;
    email?: string;
    contact_person?: string;
    payment_terms?: string;
    bank_account?: string;
    ifsc?: string;
    pan_number?: string;
    notes?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
