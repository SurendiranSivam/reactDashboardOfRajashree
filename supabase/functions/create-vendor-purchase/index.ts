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

        const purchaseData = await req.json()

        // Validate required fields
        if (!purchaseData.vendor_id || !purchaseData.invoice_number || !purchaseData.items) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: vendor_id, invoice_number, items' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Calculate total amount from items
        const items = purchaseData.items || []
        const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.unit_price)
        }, 0)

        // Insert purchase
        const { data: purchase, error: purchaseError } = await supabaseClient
            .from('purchase')
            .insert({
                vendor_id: purchaseData.vendor_id,
                invoice_number: purchaseData.invoice_number,
                invoice_date: purchaseData.invoice_date || new Date().toISOString(),
                total_amount: totalAmount,
                payment_status: purchaseData.payment_status || 'Pending',
                invoice_image_url: purchaseData.invoice_image_url || null,
                notes: purchaseData.notes || null,
            })
            .select()
            .single()

        if (purchaseError) {
            console.error('Error creating purchase:', purchaseError)
            return new Response(
                JSON.stringify({ error: purchaseError.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Insert purchase items
        const itemsToInsert = items.map((item: any) => ({
            purchase_id: purchase.purchase_id,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
        }))

        const { error: itemsError } = await supabaseClient
            .from('purchase_item')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating purchase items:', itemsError)
            // Rollback purchase
            await supabaseClient
                .from('purchase')
                .delete()
                .eq('purchase_id', purchase.purchase_id)

            return new Response(
                JSON.stringify({ error: 'Failed to create purchase items: ' + itemsError.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        return new Response(
            JSON.stringify({ purchase, success: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 201,
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
