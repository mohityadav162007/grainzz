import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getSupabaseAdmin, PHONEPE_PG_BASE_URL, logPaymentEvent } from '@/lib/phonepe';

export const runtime = 'nodejs';

/**
 * POST /api/payments/phonepe/create
 * 
 * Creates a PhonePe payment for an existing order.
 * The order's total_amount is read server-side from the database (anti-spoofing).
 * 
 * Request: { orderId: string }
 * Response: { success, redirectUrl, merchantOrderId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch order from DB (server-side, anti-spoofing)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, payment_status, merchant_transaction_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    // If there's already a merchant_transaction_id and payment is still pending,
    // we can reuse it to avoid creating duplicate PhonePe orders
    let merchantOrderId = order.merchant_transaction_id;
    
    if (!merchantOrderId || order.payment_status === 'failed') {
      // Generate new merchant order ID
      merchantOrderId = `GRZ_${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`;

      // 2. Update order with merchant order ID
      await supabase
        .from('orders')
        .update({
          merchant_transaction_id: merchantOrderId,
          payment_status: 'pending',
          status: 'pending',
        })
        .eq('id', orderId);
    }

    // 3. Get PhonePe access token
    const accessToken = await getAccessToken();

    // 4. Build site URL for redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

    // 5. Create PhonePe payment
    const payPayload = {
      merchantOrderId,
      amount: Math.round(order.total_amount * 100), // Convert to paise
      expireAfter: 1200, // 20 minutes
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'Grainzz Order Payment',
        merchantUrls: {
          redirectUrl: `${siteUrl}/payment/verify?orderId=${orderId}`,
          callbackUrl: `${siteUrl}/api/payments/phonepe/webhook`,
        },
      },
    };

    const payResponse = await fetch(`${PHONEPE_PG_BASE_URL}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(payPayload),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    const payData = await payResponse.json();

    // Log the event (non-blocking)
    logPaymentEvent('phonepe_create_payment', {
      orderId,
      merchantOrderId,
      payload: payPayload,
      response: payData,
      status: payResponse.status,
    });

    if (!payResponse.ok) {
      console.error('PhonePe create payment failed:', payData);
      return NextResponse.json(
        { error: 'Payment initiation failed. Please try again.' },
        { status: 502 }
      );
    }

    const redirectUrl = payData?.redirectUrl || payData?.data?.redirectUrl;
    const checkoutSessionId = payData?.orderId || payData?.data?.orderId || '';

    if (!redirectUrl) {
      console.error('No redirectUrl from PhonePe:', payData);
      return NextResponse.json(
        { error: 'Payment gateway did not return checkout URL. Please try again.' },
        { status: 502 }
      );
    }

    // Update order with PhonePe order ID if available
    if (checkoutSessionId) {
      await supabase
        .from('orders')
        .update({ phonepe_order_id: checkoutSessionId })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      data: {
        redirectUrl,
        merchantOrderId,
        checkoutSessionId,
      },
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    logPaymentEvent('phonepe_create_error', { error: error.message });
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
