import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Fetch all purchases with vendor info and items
        const { data: purchases, error } = await supabaseClient
            .from('purchase')
            .select(`
        *,
        vendor:vendor_id (
          vendor_id,
          name,
          contact_number
        ),
        purchase_items:purchase_item (
          purchase_item_id,
          sku,
          quantity,
          unit_price,
          total_price
        )
      `)
            .order('invoice_date', { ascending: false })

        if (error) {
            console.error('Error fetching purchases:', error)
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Calculate stats
        const stats = {
            totalPurchases: purchases?.length || 0,
            totalAmount: purchases?.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0) || 0,
            paidCount: purchases?.filter(p => p.payment_status === 'Paid').length || 0,
            pendingCount: purchases?.filter(p => p.payment_status === 'Pending').length || 0,
        }

        return new Response(
            JSON.stringify({ purchases, stats }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
