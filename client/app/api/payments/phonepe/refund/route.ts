import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getSupabaseAdmin, PHONEPE_PG_BASE_URL, logPaymentEvent } from '@/lib/phonepe';

export const runtime = 'nodejs';

/**
 * POST /api/payments/phonepe/refund
 * 
 * Initiates a refund for a paid order.
 * Should be restricted to admin users in production.
 * 
 * Request: { orderId: string, amount?: number }
 * If amount is omitted, full refund is initiated.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('merchant_transaction_id, payment_status, total_amount, refund_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Can only refund paid orders' }, { status: 400 });
    }

    if (order.refund_status === 'completed') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
    }

    if (!order.merchant_transaction_id) {
      return NextResponse.json({ error: 'No payment reference found' }, { status: 400 });
    }

    const refundAmount = amount || order.total_amount;
    const merchantRefundOrderId = `GRZR_${crypto.randomUUID().replace(/-/g, '').substring(0, 18)}`;

    const accessToken = await getAccessToken();

    const refundPayload = {
      merchantOrderId: merchantRefundOrderId,
      originalMerchantOrderId: order.merchant_transaction_id,
      amount: Math.round(refundAmount * 100), // paise
    };

    const refundResponse = await fetch(`${PHONEPE_PG_BASE_URL}/checkout/v2/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(refundPayload),
      signal: AbortSignal.timeout(15000),
    });

    const refundData = await refundResponse.json();

    await logPaymentEvent('phonepe_refund_initiated', {
      orderId,
      merchantRefundOrderId,
      amount: refundAmount,
      response: refundData,
    });

    if (!refundResponse.ok) {
      console.error('PhonePe refund failed:', refundData);
      return NextResponse.json(
        { error: 'Refund initiation failed' },
        { status: 502 }
      );
    }

    // Mark order as refund processing
    await supabase
      .from('orders')
      .update({
        refund_status: 'processing',
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      data: {
        merchantRefundOrderId,
        amount: refundAmount,
        status: 'processing',
      },
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate refund' },
      { status: 500 }
    );
  }
}
