import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExotelCallStatusWebhook {
    CallSid: string;
    CallStatus: string; // ringing, in-progress, completed, busy, no-answer, failed
    CallDuration?: string;
    StartTime?: string;
    EndTime?: string;
    RecordingUrl?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Parse Exotel webhook data
        const formData = await req.formData();
        const statusData: ExotelCallStatusWebhook = {
            CallSid: formData.get('CallSid') as string,
            CallStatus: formData.get('CallStatus') as string,
            CallDuration: formData.get('CallDuration') as string | undefined,
            StartTime: formData.get('StartTime') as string | undefined,
            EndTime: formData.get('EndTime') as string | undefined,
            RecordingUrl: formData.get('RecordingUrl') as string | undefined,
        };

        console.log('Call status update:', statusData);

        // Get call log
        const { data: callLog } = await supabase
            .from('call_logs')
            .select('*')
            .eq('call_sid', statusData.CallSid)
            .single();

        if (!callLog) {
            return new Response(JSON.stringify({ error: 'Call log not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Update call log
        const updates: any = {
            status: statusData.CallStatus,
        };

        if (statusData.CallStatus === 'in-progress' && !callLog.answered_at) {
            updates.answered_at = new Date().toISOString();
        }

        if (statusData.CallStatus === 'completed') {
            updates.ended_at = new Date().toISOString();
            updates.duration = parseInt(statusData.CallDuration || '0');

            // Auto-create query for completed calls
            if (!callLog.auto_query_created) {
                const { data: newQuery } = await supabase
                    .from('queries')
                    .insert({
                        customer_id: callLog.customer_id,
                        name: 'Call Query', // Will be updated with actual customer name
                        mobile_number: callLog.from_number,
                        message: `Phone call on ${new Date().toLocaleString()}. Duration: ${Math.floor(parseInt(statusData.CallDuration || '0') / 60)} minutes.`,
                        status: 'In Progress',
                        source: 'Phone',
                        priority: 'Medium',
                    })
                    .select()
                    .single();

                if (newQuery) {
                    updates.query_id = newQuery.query_id;
                    updates.auto_query_created = true;
                }
            }
        }

        await supabase
            .from('call_logs')
            .update(updates)
            .eq('call_sid', statusData.CallSid);

        // Update executive availability
        if (statusData.CallStatus === 'completed' || statusData.CallStatus === 'failed' || statusData.CallStatus === 'no-answer') {
            if (callLog.executive_id) {
                await supabase
                    .from('executive_availability')
                    .update({
                        status: 'online',
                        current_call_id: null,
                        last_call_at: new Date().toISOString(),
                        total_calls_today: supabase.rpc('increment', { x: 1 }),
                        total_duration_today: supabase.rpc('increment', { x: parseInt(statusData.CallDuration || '0') }),
                    })
                    .eq('executive_id', callLog.executive_id);
            }

            // Remove from queue if exists
            await supabase
                .from('call_queue')
                .update({ status: 'connected', connected_at: new Date().toISOString() })
                .eq('call_sid', statusData.CallSid);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling call status:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
