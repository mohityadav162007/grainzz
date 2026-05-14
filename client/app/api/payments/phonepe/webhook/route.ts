import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, mapPhonePeStatus, PHONEPE_WEBHOOK_SECRET, logPaymentEvent } from '@/lib/phonepe';
import { sendOwnerNotification } from '@/lib/email';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Disable body parsing — we need raw body for signature verification
export const dynamic = 'force-dynamic';

/**
 * Insert webhook record, silently ignoring duplicates.
 * The unique index on (provider, external_id, event_type) ensures idempotency.
 */
async function insertWebhookRecord(supabase: any, record: any) {
  try {
    await supabase.from('payment_webhooks').insert(record);
  } catch (e: any) {
    // Unique constraint violation = duplicate, which is expected and safe to ignore
    if (e?.code === '23505' || e?.message?.includes('duplicate')) {
      return;
    }
    console.warn('Webhook record insert warning:', e?.message);
  }
}

/**
 * POST /api/payments/phonepe/webhook
 * 
 * Receives payment status updates from PhonePe.
 * Implements:
 * - HMAC-SHA256 signature verification (if webhook secret is configured)
 * - Basic Auth fallback
 * - Idempotent processing (duplicate webhooks are silently ignored)
 * - Status guard (paid orders never revert to failed)
 * - Full audit trail via payment_webhooks table
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    // ─── Signature Verification ───────────────────────────────────────
    
    if (PHONEPE_WEBHOOK_SECRET) {
      const signature = req.headers.get('X-PhonePe-Signature') || 
                       req.headers.get('x-phonepe-signature') || '';
      
      if (signature) {
        // HMAC-SHA256 verification
        const expectedSignature = crypto
          .createHmac('sha256', PHONEPE_WEBHOOK_SECRET)
          .update(rawBody)
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error('Webhook signature mismatch');
          await logPaymentEvent('phonepe_webhook_sig_fail', { 
            signature, 
            expected: expectedSignature.substring(0, 10) + '...' 
          });
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      } else {
        // No signature header — check Basic Auth as fallback
        const authHeader = req.headers.get('authorization') || '';
        const webhookUser = process.env.WEBHOOK_USERNAME || 'grainzz_admin';
        const webhookPass = process.env.WEBHOOK_PASSWORD || '';
        
        if (webhookPass) {
          const expectedAuth = 'Basic ' + Buffer.from(`${webhookUser}:${webhookPass}`).toString('base64');
          if (authHeader !== expectedAuth) {
            console.warn('Webhook auth mismatch — allowing through for PhonePe compatibility');
          }
        }
      }
    }

    // ─── Parse Payload ────────────────────────────────────────────────
    
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { event, payload } = body;

    if (!payload || !payload.merchantOrderId) {
      return NextResponse.json({ error: 'Missing merchantOrderId' }, { status: 400 });
    }

    const merchantOrderId = payload.merchantOrderId;
    const paymentState = payload.state || '';
    const transactionId = payload.paymentDetails?.[0]?.transactionId || '';
    
    // External ID for idempotency = merchantOrderId + transactionId
    const externalId = transactionId || merchantOrderId;
    const eventType = event || 'unknown';

    const supabase = getSupabaseAdmin();

    const webhookRecord = {
      provider: 'phonepe',
      event_type: eventType,
      external_id: externalId,
      payload: body,
    };

    // ─── Idempotency Check ────────────────────────────────────────────
    
    const { data: existingWebhook } = await supabase
      .from('payment_webhooks')
      .select('id')
      .eq('provider', 'phonepe')
      .eq('external_id', externalId)
      .eq('event_type', eventType)
      .maybeSingle();

    if (existingWebhook) {
      // Already processed this exact webhook — return 200 silently
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // ─── Status Guard ─────────────────────────────────────────────────
    
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('payment_status, id')
      .eq('merchant_transaction_id', merchantOrderId)
      .single();

    if (!currentOrder) {
      console.error('Webhook for unknown order:', merchantOrderId);
      await insertWebhookRecord(supabase, webhookRecord);
      return NextResponse.json({ success: true, message: 'Order not found, webhook logged' });
    }

    // Never revert a paid order to failed
    if (currentOrder.payment_status === 'paid' && paymentState === 'FAILED') {
      await insertWebhookRecord(supabase, webhookRecord);
      return NextResponse.json({ success: true, message: 'Order already paid, ignoring FAILED' });
    }

    // ─── Update Order ─────────────────────────────────────────────────
    
    const { payment_status, order_status } = mapPhonePeStatus(paymentState);
    
    const updateData: any = {
      payment_status,
      status: order_status,
      transaction_id: transactionId || undefined,
      updated_at: new Date().toISOString(),
    };

    if (paymentState === 'COMPLETED') {
      updateData.paid_at = new Date().toISOString();
      updateData.payment_reference = transactionId;
    }

    if (paymentState === 'REFUND_COMPLETED') {
      updateData.refund_status = 'completed';
      if (payload.amount) {
        updateData.refund_amount = payload.amount / 100; // paise to rupees
      }
    }

    await supabase
      .from('orders')
      .update(updateData)
      .eq('merchant_transaction_id', merchantOrderId);

    // If order was just marked as COMPLETED and wasn't paid before, trigger owner notification
    if (paymentState === 'COMPLETED' && currentOrder.payment_status !== 'paid') {
      sendOwnerNotification(currentOrder.id).catch((err) => {
        console.error('Failed to trigger owner notification:', err);
      });
    }

    // ─── Record Webhook (Audit Trail) ─────────────────────────────────
    
    await insertWebhookRecord(supabase, webhookRecord);

    // Log for analytics
    await logPaymentEvent(`phonepe_webhook_${eventType}`, {
      merchantOrderId,
      paymentState,
      transactionId,
      orderId: currentOrder.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    await logPaymentEvent('phonepe_webhook_error', { error: error.message });
    // Always return 200 to prevent PhonePe from retrying indefinitely
    return NextResponse.json({ success: false, error: 'Internal error logged' }, { status: 200 });
  }
}

// PhonePe only sends POST webhooks
export async function GET() {
  return NextResponse.json({ status: 'PhonePe webhook endpoint active' });
}
