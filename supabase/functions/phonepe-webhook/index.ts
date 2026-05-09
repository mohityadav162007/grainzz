// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const webhookUser = Deno.env.get('WEBHOOK_USERNAME') || 'grainzz_admin';
    const webhookPass = Deno.env.get('WEBHOOK_PASSWORD') || 'GRZ_Pay_2026!#';
    const expectedAuth = 'Basic ' + btoa(`${webhookUser}:${webhookPass}`);

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized webhook attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { event, payload } = body;

    if (!payload || !payload.merchantOrderId) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const merchantOrderId = payload.merchantOrderId;
    const paymentState = payload.state;
    const transactionId = payload.paymentDetails?.[0]?.transactionId || '';

    // Check current status to avoid redundant updates
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('merchant_transaction_id', merchantOrderId)
      .single();

    if (currentOrder?.payment_status === 'paid') {
      return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200 });
    }

    if (event === 'checkout.order.completed' && paymentState === 'COMPLETED') {
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid', 
          status: 'paid', 
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('merchant_transaction_id', merchantOrderId);
    } else if (event === 'checkout.order.failed' || paymentState === 'FAILED') {
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'failed', 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('merchant_transaction_id', merchantOrderId);
    }

    await supabase.from('analytics_logs').insert({
      event_type: `phonepe_webhook_${event}`,
      event_data: body
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
