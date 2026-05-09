import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const expectedAuth = 'Basic ' + btoa('grainzz_admin:GRZ_Pay_2026!#');

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized webhook attempt: Invalid credentials');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    console.log('PhonePe Webhook received:', JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // As per PhonePe Documentation:
    // 1. Use the "event" parameter to identify the event type
    // 2. Use the "payload.state" parameter for the payment status
    const { event, payload } = body;

    if (!payload || !payload.merchantOrderId) {
      console.error('Invalid webhook payload: missing merchantOrderId');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const merchantOrderId = payload.merchantOrderId;
    const paymentState = payload.state; // e.g., COMPLETED, FAILED, PENDING
    const transactionId = payload.paymentDetails?.[0]?.transactionId || '';

    console.log(`Processing Order: ${merchantOrderId}, Event: ${event}, State: ${paymentState}`);

    // Update the order based on the event and state
    if (event === 'checkout.order.completed' && paymentState === 'COMPLETED') {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid', 
          status: 'paid', 
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('merchant_transaction_id', merchantOrderId);
      
      if (error) throw error;
      console.log(`Successfully marked order ${merchantOrderId} as PAID`);

    } else if (event === 'checkout.order.failed' || paymentState === 'FAILED') {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'failed', 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('merchant_transaction_id', merchantOrderId);

      if (error) throw error;
      console.log(`Marked order ${merchantOrderId} as FAILED`);
    }

    // Always log the event for analytics/debugging
    await supabase.from('analytics_logs').insert({
      event_type: `phonepe_webhook_${event}`,
      event_data: body
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
