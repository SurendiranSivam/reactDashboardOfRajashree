import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExotelIncomingCallWebhook {
    CallSid: string;
    From: string;
    To: string;
    CallStatus: string;
    Direction: string;
    Digits?: string; // IVR input (1, 2, 3)
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Parse Exotel webhook data (form-urlencoded)
        const formData = await req.formData();
        const callData: ExotelIncomingCallWebhook = {
            CallSid: formData.get('CallSid') as string,
            From: formData.get('From') as string,
            To: formData.get('To') as string,
            CallStatus: formData.get('CallStatus') as string,
            Direction: formData.get('Direction') as string,
            Digits: formData.get('Digits') as string | undefined,
        };

        console.log('Incoming call:', callData);

        // Map IVR selection
        let ivrSelection = 'General';
        if (callData.Digits) {
            switch (callData.Digits) {
                case '1':
                    ivrSelection = 'Sales';
                    break;
                case '2':
                    ivrSelection = 'Support';
                    break;
                case '3':
                    ivrSelection = 'Returns';
                    break;
            }
        }

        // Find customer by phone number
        const { data: customer } = await supabase
            .from('customers')
            .select('customer_id')
            .eq('mobile_number', callData.From)
            .single();

        // Find available executive (status = 'online')
        const { data: availableExecutive } = await supabase
            .from('executive_availability')
            .select('executive_id, users(user_id, full_name)')
            .eq('status', 'online')
            .order('last_call_at', { ascending: true, nullsFirst: true })
            .limit(1)
            .single();

        let response_xml = '';

        if (availableExecutive) {
            // Create call log
            const { data: callLog } = await supabase
                .from('call_logs')
                .insert({
                    call_sid: callData.CallSid,
                    from_number: callData.From,
                    to_number: callData.To,
                    executive_id: availableExecutive.executive_id,
                    customer_id: customer?.customer_id,
                    direction: 'inbound',
                    status: 'ringing',
                    ivr_selection: ivrSelection,
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();

            // Update executive availability
            await supabase
                .from('executive_availability')
                .update({
                    status: 'on-call',
                    current_call_id: callLog.call_id,
                })
                .eq('executive_id', availableExecutive.executive_id);

            // Get executive's phone number
            const { data: executiveUser } = await supabase
                .from('users')
                .select('full_name')
                .eq('user_id', availableExecutive.executive_id)
                .single();

            // Exotel XML response to connect call
            // Note: Replace with actual executive phone number in production
            response_xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling Rajashree Fashion. Connecting you to ${executiveUser?.full_name || 'our executive'}.</Say>
  <Dial record="true" recordingStatusCallback="${supabaseUrl}/functions/v1/handle-recording-ready">
    <Number>EXECUTIVE_PHONE_NUMBER</Number>
  </Dial>
</Response>`;
        } else {
            // All executives busy - add to queue
            await supabase.from('call_queue').insert({
                call_sid: callData.CallSid,
                from_number: callData.From,
                ivr_selection: ivrSelection,
                status: 'waiting',
            });

            response_xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, all our executives are currently busy. Your call is important to us. Please hold.</Say>
  <Play>http://your-server.com/hold-music.mp3</Play>
  <Redirect>${supabaseUrl}/functions/v1/handle-incoming-call</Redirect>
</Response>`;
        }

        return new Response(response_xml, {
            headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
        });
    } catch (error) {
        console.error('Error handling incoming call:', error);

        const error_xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, there was an error processing your call. Please try again later.</Say>
  <Hangup/>
</Response>`;

        return new Response(error_xml, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
        });
    }
});
