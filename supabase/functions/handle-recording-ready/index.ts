import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExotelRecordingWebhook {
    CallSid: string;
    RecordingUrl: string;
    RecordingDuration: string;
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
        const recordingData: ExotelRecordingWebhook = {
            CallSid: formData.get('CallSid') as string,
            RecordingUrl: formData.get('RecordingUrl') as string,
            RecordingDuration: formData.get('RecordingDuration') as string,
        };

        console.log('Recording ready:', recordingData);

        // Optional: Download and upload to Supabase Storage
        // This keeps recordings accessible even if Exotel deletes them
        try {
            const recordingResponse = await fetch(recordingData.RecordingUrl);
            const recordingBlob = await recordingResponse.blob();

            const fileName = `call-recordings/${recordingData.CallSid}.mp3`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('call-recordings')
                .upload(fileName, recordingBlob, {
                    contentType: 'audio/mpeg',
                    upsert: true,
                });

            if (uploadError) {
                console.error('Error uploading recording:', uploadError);
            } else {
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('call-recordings')
                    .getPublicUrl(fileName);

                // Update call log with recording URL
                await supabase
                    .from('call_logs')
                    .update({
                        recording_url: publicUrl,
                        recording_duration: parseInt(recordingData.RecordingDuration),
                    })
                    .eq('call_sid', recordingData.CallSid);

                return new Response(JSON.stringify({ success: true, url: publicUrl }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        } catch (downloadError) {
            console.error('Error downloading recording:', downloadError);

            // Fallback: Just save Exotel URL
            await supabase
                .from('call_logs')
                .update({
                    recording_url: recordingData.RecordingUrl,
                    recording_duration: parseInt(recordingData.RecordingDuration),
                })
                .eq('call_sid', recordingData.CallSid);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error handling recording:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
