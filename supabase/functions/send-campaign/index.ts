import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
    campaignId: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { campaignId }: SendCampaignRequest = await req.json();

        // Fetch campaign
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (campaignError || !campaign) {
            return new Response(
                JSON.stringify({ success: false, error: 'Campaign not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (campaign.status === 'sent') {
            return new Response(
                JSON.stringify({ success: false, error: 'Campaign already sent' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch target customers based on segment
        let customersQuery = supabase.from('customers').select('full_name, mobile_number, email');

        if (campaign.target_segment === 'vip') {
            // Assuming VIP customers have certain criteria
            // Adjust based on your schema
            customersQuery = customersQuery.gte('total_orders', 5);
        }

        const { data: customers, error: customersError } = await customersQuery;

        if (customersError || !customers || customers.length === 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'No customers found for segment' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        let sentCount = 0;
        let failedCount = 0;

        if (campaign.channel === 'email') {
            // Send via Resend
            if (!resendApiKey) {
                return new Response(
                    JSON.stringify({ success: false, error: 'Resend API key not configured' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            for (const customer of customers) {
                if (!customer.email) continue;

                try {
                    const response = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendApiKey}`,
                        },
                        body: JSON.stringify({
                            from: 'Rajashree Fashion <noreply@rajashreefashion.com>',
                            to: [customer.email],
                            subject: campaign.subject_line,
                            html: campaign.content.replace('{{name}}', customer.full_name || 'Customer'),
                        }),
                    });

                    if (response.ok) {
                        sentCount++;
                    } else {
                        failedCount++;
                        console.error(`Failed to send email to ${customer.email}`);
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error sending email:`, error);
                }
            }
        } else if (campaign.channel === 'sms') {
            // Send via Twilio
            if (!twilioSid || !twilioToken || !twilioPhone) {
                return new Response(
                    JSON.stringify({ success: false, error: 'Twilio credentials not configured' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

            for (const customer of customers) {
                if (!customer.mobile_number) continue;

                try {
                    const response = await fetch(
                        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': `Basic ${twilioAuth}`,
                            },
                            body: new URLSearchParams({
                                From: twilioPhone,
                                To: customer.mobile_number,
                                Body: campaign.content.replace('{{name}}', customer.full_name || 'Customer'),
                            }),
                        }
                    );

                    if (response.ok) {
                        sentCount++;
                    } else {
                        failedCount++;
                        console.error(`Failed to send SMS to ${customer.mobile_number}`);
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error sending SMS:`, error);
                }
            }
        }

        // Update campaign status
        await supabase
            .from('campaigns')
            .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
            })
            .eq('id', campaignId);

        return new Response(
            JSON.stringify({
                success: true,
                sentCount,
                failedCount,
                totalTargeted: customers.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error sending campaign:', error);
        return new Response(
            JSON.stringify({ success: false, error: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
