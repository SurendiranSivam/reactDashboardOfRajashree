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

        const vendorData = await req.json()

        // Validate required fields
        if (!vendorData.name || !vendorData.address || !vendorData.contact_number) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: name, address, contact_number' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Insert vendor
        const { data: vendor, error } = await supabaseClient
            .from('vendor')
            .insert({
                name: vendorData.name,
                address: vendorData.address,
                contact_number: vendorData.contact_number,
                gst: vendorData.gst || '',
                email: vendorData.email || null,
                contact_person: vendorData.contact_person || null,
                payment_terms: vendorData.payment_terms || null,
                bank_account: vendorData.bank_account || null,
                ifsc: vendorData.ifsc || null,
                pan_number: vendorData.pan_number || null,
                notes: vendorData.notes || null,
                is_active: vendorData.is_active ?? true,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating vendor:', error)
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        return new Response(
            JSON.stringify({ vendor, success: true }),
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
