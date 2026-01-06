import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateCouponRequest {
    code: string;
    cartTotal: number;
    cartItems?: Array<{ variant_id: number; quantity: number }>;
}

interface ValidateCouponResponse {
    valid: boolean;
    discountAmount?: number;
    newTotal?: number;
    reason?: string;
    coupon?: any;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { code, cartTotal, cartItems }: ValidateCouponRequest = await req.json();

        if (!code || cartTotal === undefined) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: 'Missing required fields: code and cartTotal'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        // Fetch coupon
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !coupon) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: 'Invalid coupon code'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check if active
        if (!coupon.is_active) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: 'Coupon is inactive'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check dates
        const now = new Date();
        const startsAt = new Date(coupon.starts_at);
        const expiresAt = new Date(coupon.expires_at);

        if (now < startsAt) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: `Coupon not yet active. Starts on ${startsAt.toLocaleDateString()}`
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (now > expiresAt) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: 'Coupon has expired'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check usage limit
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: 'Coupon usage limit reached'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check minimum order value
        if (cartTotal < coupon.min_order_value) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    reason: `Minimum order value is ₹${coupon.min_order_value}`
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Calculate discount
        let discountAmount = 0;

        switch (coupon.type) {
            case 'percentage':
                discountAmount = (cartTotal * coupon.value) / 100;
                // Cap at cart total
                discountAmount = Math.min(discountAmount, cartTotal);
                break;

            case 'fixed_amount':
                discountAmount = Math.min(coupon.value, cartTotal);
                break;

            case 'buy_x_get_y':
                // For buy_x_get_y, value represents the discount percentage on eligible items
                // This would require cartItems to calculate properly
                // Simplified: apply percentage discount on total
                discountAmount = (cartTotal * coupon.value) / 100;
                break;

            default:
                return new Response(
                    JSON.stringify({
                        valid: false,
                        reason: 'Invalid coupon type'
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
        }

        const newTotal = Math.max(0, cartTotal - discountAmount);

        return new Response(
            JSON.stringify({
                valid: true,
                discountAmount: Math.round(discountAmount * 100) / 100,
                newTotal: Math.round(newTotal * 100) / 100,
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error validating coupon:', error);
        return new Response(
            JSON.stringify({
                valid: false,
                reason: 'Internal server error',
                error: String(error)
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
