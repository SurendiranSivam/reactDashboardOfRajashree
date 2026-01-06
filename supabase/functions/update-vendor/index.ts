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

        // Validate vendor_id
        if (!vendorData.vendor_id) {
            return new Response(
                JSON.stringify({ error: 'Missing vendor_id' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        const vendorId = vendorData.vendor_id
        delete vendorData.vendor_id

        // Update vendor
        const { data: vendor, error } = await supabaseClient
            .from('vendor')
            .update({
                ...vendorData,
                updated_at: new Date().toISOString(),
            })
            .eq('vendor_id', vendorId)
            .select()
            .single()

        if (error) {
            console.error('Error updating vendor:', error)
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
