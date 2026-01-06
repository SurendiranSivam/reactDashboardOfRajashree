export interface Return {
    return_id?: number;
    order_id?: string | null;
    return_date?: string;
    status: string;
    reason?: string | null;
    returned_items?: string | null;
    refund_amount?: number | null;
    created_at?: string;
    updated_at?: string;
}

export const RETURN_STATUSES = [
    'Requested',
    'Received',
    'Inspecting',
    'Approved',
    'Rejected',
    'Refund Initiated',
    'Refunded',
    'Closed'
] as const;

export type ReturnStatus = typeof RETURN_STATUSES[number];
