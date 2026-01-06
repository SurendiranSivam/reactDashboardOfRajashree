// Supabase Edge Function: send-email
// Using Resend.com API (much more reliable than SMTP)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { to, subject, html, text } = await req.json();

        if (!to || !subject || (!html && !text)) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: to, subject, and html/text' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // Option 1: Use Resend.com (Get free API key at resend.com)
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_123456789'; // Replace with your key

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Rajashree Fashions <onboarding@resend.dev>', // Use your verified domain
                to: [to],
                subject: subject,
                html: html || `<p>${text}</p>`,
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error('Resend API error:', resendData);
            throw new Error(resendData.message || 'Email send failed');
        }

        console.log(`✅ Email sent to ${to} via Resend`);

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully', id: resendData.id }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('❌ Email send error:', error);

        return new Response(
            JSON.stringify({ error: error.message || 'Failed to send email' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
