import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const PHONEPE_MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID') || '';
const PHONEPE_SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY') || '';
const PHONEPE_SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX') || '1';
const PHONEPE_BASE_URL = Deno.env.get('PHONEPE_BASE_URL') || 'https://api.phonepe.com/apis/hermes';
const PHONEPE_REDIRECT_URL = Deno.env.get('PHONEPE_REDIRECT_URL') || '';
const PHONEPE_CALLBACK_URL = Deno.env.get('PHONEPE_CALLBACK_URL') || '';

async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

serve(async (req) => {
  const { url, method } = req;
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const body = await req.json();
    const { action } = body;

    if (action === 'initiate') {
      const { orderId, amount, userPhone } = body;
      const merchantTransactionId = `MT_${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`;

      // Update order
      await supabase.from('orders').update({ merchant_transaction_id: merchantTransactionId }).eq('id', orderId);

      const payload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: `USER_${userPhone}`,
        amount: Math.round(amount * 100),
        redirectUrl: `${PHONEPE_REDIRECT_URL}?orderId=${orderId}`,
        redirectMode: 'REDIRECT',
        callbackUrl: PHONEPE_CALLBACK_URL,
        mobileNumber: userPhone,
        paymentInstrument: { type: 'PAY_PAGE' }
      };

      const base64Payload = base64Encode(JSON.stringify(payload));
      const checksumStr = `${base64Payload}/pg/v1/pay${PHONEPE_SALT_KEY}`;
      const checksum = await sha256(checksumStr);
      const xVerify = `${checksum}###${PHONEPE_SALT_INDEX}`;

      const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify },
        body: JSON.stringify({ request: base64Payload })
      });

      const phonePeData = await response.json();
      const redirectUrl = phonePeData.data?.instrumentResponse?.redirectInfo?.url;
      
      if (!redirectUrl) throw new Error('Payment URL not received from PhonePe');
      return new Response(JSON.stringify({ success: true, data: { redirectUrl, merchantTransactionId } }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else if (action === 'status') {
      const { merchantTransactionId } = body;
      const checksumStr = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}${PHONEPE_SALT_KEY}`;
      const checksum = await sha256(checksumStr);
      const xVerify = `${checksum}###${PHONEPE_SALT_INDEX}`;

      const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify, 'X-MERCHANT-ID': PHONEPE_MERCHANT_ID }
      });

      const phonePeData = await response.json();
      if (phonePeData.code === 'PAYMENT_SUCCESS') {
        await supabase.from('orders').update({
          payment_status: 'paid', status: 'paid', transaction_id: phonePeData.data?.transactionId || '' 
        }).eq('merchant_transaction_id', merchantTransactionId);
      }
      return new Response(JSON.stringify({ success: true, data: phonePeData }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
});
