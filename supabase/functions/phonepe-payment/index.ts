// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

declare const Deno: any;

// ─── Configuration ───────────────────────────────────────────────────────────

const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID') || '';
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET') || '';
const PHONEPE_CLIENT_VERSION = Deno.env.get('PHONEPE_CLIENT_VERSION') || '1';
const PHONEPE_REDIRECT_URL = Deno.env.get('PHONEPE_REDIRECT_URL') || '';
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/pg';
const PHONEPE_TOKEN_URL = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Token Management (inline, same as phonepe-token) ────────────────────────

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getPhonePeToken(supabase: any): Promise<string> {
  const now = Date.now();

  // Check in-memory cache
  if (cachedToken && cachedToken.expires_at > now + 60_000) {
    return cachedToken.access_token;
  }

  // Check DB cache
  const { data: cached } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'phonepe_auth_token')
    .single();

  if (cached?.value) {
    try {
      const parsed = JSON.parse(cached.value);
      if (parsed.expires_at && parsed.expires_at > now + 60_000) {
        cachedToken = parsed;
        return parsed.access_token;
      }
    } catch {
      // expired or invalid
    }
  }

  // Fetch new token
  const tokenResponse = await fetch(PHONEPE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: PHONEPE_CLIENT_ID,
      client_secret: PHONEPE_CLIENT_SECRET,
      client_version: PHONEPE_CLIENT_VERSION,
      grant_type: 'client_credentials',
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Token request failed (${tokenResponse.status}): ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  const access_token = tokenData.access_token;
  const expires_in = tokenData.expires_in || 3600;
  const expires_at = now + expires_in * 1000;

  if (!access_token) {
    throw new Error('No access_token in PhonePe token response');
  }

  cachedToken = { access_token, expires_at };

  // Persist to DB
  const tokenJson = JSON.stringify({ access_token, expires_at });
  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .eq('key', 'phonepe_auth_token')
    .single();

  if (existing) {
    await supabase.from('store_settings').update({ value: tokenJson }).eq('key', 'phonepe_auth_token');
  } else {
    await supabase.from('store_settings').insert({
      key: 'phonepe_auth_token',
      value: tokenJson,
      description: 'PhonePe OAuth token cache (auto-managed)',
    });
  }

  return access_token;
}

// ─── Helper for Logging ───────────────────────────────────────────────────────
async function logPhonePeEvent(supabase: any, type: string, data: any) {
  try {
    await supabase.from('analytics_logs').insert({
      event_type: type,
      event_data: data
    });
  } catch (e) {
    console.error('Failed to log event', e);
  }
}

// ─── Edge Function Handler ───────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action } = body;

    // ─── INITIATE PAYMENT ──────────────────────────────────────────────

    if (action === 'initiate') {
      const { orderId, userPhone } = body;

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Missing orderId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the order directly from the database to get the true total_amount
      // This prevents any client-side spoofing and ensures discounts are accurately applied.
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('total_amount, payment_status')
        .eq('id', orderId)
        .single();

      if (orderFetchError || !orderData) {
        return new Response(
          JSON.stringify({ error: 'Order not found or database error' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (orderData.payment_status === 'paid' || orderData.payment_status === 'processing') {
        return new Response(
          JSON.stringify({ error: 'Order is already paid or processing' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const merchantOrderId = `GRZ_${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`;
      const totalAmountFromDB = orderData.total_amount;

      await supabase
        .from('orders')
        .update({
          merchant_transaction_id: merchantOrderId,
          payment_status: 'pending',
          status: 'pending',
        })
        .eq('id', orderId);

      const accessToken = await getPhonePeToken(supabase);
      const redirectUrl = `${PHONEPE_REDIRECT_URL}?orderId=${orderId}`;

      const payPayload = {
        merchantOrderId,
        amount: Math.round(totalAmountFromDB * 100), // Convert the exact DB amount (after discounts) to paise
        expireAfter: 1200,
        paymentFlow: { 
          type: 'PG_CHECKOUT', 
          merchantUrls: { 
            redirectUrl,
            callbackUrl: Deno.env.get('PHONEPE_CALLBACK_URL') || ''
          } 
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const payResponse = await fetch(`${PHONEPE_BASE_URL}/checkout/v2/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `O-Bearer ${accessToken}` },
          body: JSON.stringify(payPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const payData = await payResponse.json();
        
        // Log the response
        await logPhonePeEvent(supabase, 'phonepe_initiate', { orderId, merchantOrderId, payload: payPayload, response: payData });

        if (!payResponse.ok) {
          throw new Error(payData.message || `PhonePe pay failed (${payResponse.status})`);
        }

        const phonePeRedirectUrl = payData?.redirectUrl || payData?.data?.redirectUrl;
        if (!phonePeRedirectUrl) {
          throw new Error('No redirectUrl received from PhonePe');
        }

        return new Response(
          JSON.stringify({ success: true, data: { redirectUrl: phonePeRedirectUrl, merchantOrderId } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        clearTimeout(timeoutId);
        await logPhonePeEvent(supabase, 'phonepe_error', { action: 'initiate', orderId, error: err.message });
        throw err;
      }
    }

    // ─── CHECK PAYMENT STATUS / CALLBACK ───────────────────────────────

    if (action === 'status' || action === 'callback') {
      const { merchantOrderId, orderId } = body;

      if (!merchantOrderId && !orderId) {
        return new Response(
          JSON.stringify({ error: 'Missing merchantOrderId or orderId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let resolvedMerchantOrderId = merchantOrderId;
      if (!resolvedMerchantOrderId && orderId) {
        const { data: order } = await supabase
          .from('orders')
          .select('merchant_transaction_id')
          .eq('id', orderId)
          .single();

        if (!order?.merchant_transaction_id) {
          throw new Error('Order not found or no merchantOrderId associated');
        }
        resolvedMerchantOrderId = order.merchant_transaction_id;
      }

      const accessToken = await getPhonePeToken(supabase);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const statusResponse = await fetch(
          `${PHONEPE_BASE_URL}/checkout/v2/order/${resolvedMerchantOrderId}/status?details=true`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `O-Bearer ${accessToken}` },
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        const statusData = await statusResponse.json();
        
        await logPhonePeEvent(supabase, 'phonepe_status', { merchantOrderId: resolvedMerchantOrderId, response: statusData });

        const paymentState = statusData?.state;
        const transactionId = statusData?.paymentDetails?.[0]?.transactionId || '';

        if (paymentState === 'COMPLETED') {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid', status: 'paid', transaction_id: transactionId })
            .eq('merchant_transaction_id', resolvedMerchantOrderId);
        } else if (paymentState === 'FAILED') {
          await supabase
            .from('orders')
            .update({ payment_status: 'failed', status: 'cancelled' })
            .eq('merchant_transaction_id', resolvedMerchantOrderId);
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: { state: paymentState || 'UNKNOWN', orderId: orderId || null, merchantOrderId: resolvedMerchantOrderId, transactionId, raw: statusData },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        clearTimeout(timeoutId);
        await logPhonePeEvent(supabase, 'phonepe_error', { action: 'status', merchantOrderId: resolvedMerchantOrderId, error: err.message });
        throw err;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "initiate", "status", or "callback".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('phonepe-payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
