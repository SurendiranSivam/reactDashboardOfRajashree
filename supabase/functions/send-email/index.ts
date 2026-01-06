import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { to, subject, html, text } = await req.json();

        if (!to || !subject || (!html && !text)) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: to, subject, and html/text' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get Resend API key from environment
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY environment variable not configured');
        }

        // Send email via Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Rajashree Fashions <onboarding@resend.dev>',
                to: [to],
                subject: subject,
                html: html || `<p>${text}</p>`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', data);
            throw new Error(data.message || 'Email send failed');
        }

        console.log(`✅ Email sent to ${to} - ID: ${data.id}`);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                id: data.id
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('❌ Email service error:', error.message);

        return new Response(
            JSON.stringify({
                error: error.message || 'Failed to send email',
                details: 'Check if RESEND_API_KEY is configured in Edge Function settings'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
