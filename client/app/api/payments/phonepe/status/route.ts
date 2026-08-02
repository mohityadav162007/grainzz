import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getSupabaseAdmin, mapPhonePeStatus, PHONEPE_PG_BASE_URL, logPaymentEvent } from '@/lib/phonepe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/phonepe/status?orderId=<id>
 * 
 * Checks payment status with PhonePe and reconciles with database.
 * Used by:
 * - /payment/verify page (after redirect back from PhonePe)
 * - Manual reconciliation
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('merchant_transaction_id, payment_status, id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.merchant_transaction_id) {
      return NextResponse.json({
        success: true,
        data: { state: 'UNKNOWN', orderId, message: 'No payment initiated for this order' },
      });
    }

    // If already paid, return immediately (no need to hit PhonePe again)
    if (order.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        data: { state: 'COMPLETED', orderId, merchantOrderId: order.merchant_transaction_id },
      });
    }

    // Query PhonePe for current status
    const accessToken = await getAccessToken();
    
    const statusResponse = await fetch(
      `${PHONEPE_PG_BASE_URL}/checkout/v2/order/${order.merchant_transaction_id}/status?details=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `O-Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    const statusData = await statusResponse.json();
    
    await logPaymentEvent('phonepe_status_check', {
      orderId,
      merchantOrderId: order.merchant_transaction_id,
      response: statusData,
    });

    const paymentState = statusData?.state || 'UNKNOWN';
    const transactionId = statusData?.paymentDetails?.[0]?.transactionId || '';

    // Reconcile: if PhonePe says COMPLETED but DB says pending/failed → update DB
    if (paymentState === 'COMPLETED' && order.payment_status !== 'paid') {
      const { payment_status, order_status } = mapPhonePeStatus(paymentState);
      await supabase
        .from('orders')
        .update({
          payment_status,
          status: order_status,
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
          payment_reference: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    } else if (paymentState === 'FAILED' && order.payment_status === 'pending') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      data: {
        state: paymentState,
        orderId,
        merchantOrderId: order.merchant_transaction_id,
        transactionId,
      },
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
