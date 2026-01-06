// Marketing & Growth Module Types

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
    value: number;
    min_order_value: number;
    usage_limit: number | null;
    usage_count: number;
    starts_at: string;
    expires_at: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Affiliate {
    id: string;
    user_id: string;
    referral_code: string;
    commission_rate: number;
    total_earnings: number;
    bank_details?: {
        account_number?: string;
        ifsc_code?: string;
        account_holder_name?: string;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Campaign {
    id: string;
    name: string;
    subject_line: string;
    content: string;
    channel: 'email' | 'sms';
    target_segment: string;
    status: 'draft' | 'scheduled' | 'sent';
    sent_at?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ReferralLog {
    id: string;
    order_id: string;
    affiliate_id: string;
    commission_amount: number;
    order_total: number;
    commission_rate: number;
    created_at: string;
}

export interface CouponValidationResult {
    valid: boolean;
    discountAmount?: number;
    newTotal?: number;
    reason?: string;
    coupon?: Pick<Coupon, 'code' | 'type' | 'value'>;
}
