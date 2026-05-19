import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/phonepe';

export const runtime = 'nodejs';

/**
 * GET /api/coupons/verify
 * Query params: ?code=...&email=...&userId=...
 * 
 * Verifies if a given coupon code has already been used by the user or email
 * in a successfully paid order. This uses the Supabase service role key to bypass RLS,
 * which is necessary since guest users cannot query the orders table.
 */
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const email = req.nextUrl.searchParams.get('email');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 });
    }

    // If neither email nor userId is provided, we can't verify history, so assume unused.
    if (!email && !userId) {
      return NextResponse.json({ used: false });
    }

    const supabase = getSupabaseAdmin();

    // Check if the coupon is restricted to first-order only
    const { data: couponData } = await supabase
      .from('coupons')
      .select('is_first_order_only')
      .eq('code', code.toUpperCase())
      .single();

    if (couponData?.is_first_order_only) {
      let hasAnyPaidOrder = false;

      if (userId) {
        const { data } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', userId)
          .eq('payment_status', 'paid')
          .limit(1);
        if (data && data.length > 0) hasAnyPaidOrder = true;
      }

      if (email && !hasAnyPaidOrder) {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail.includes('@')) {
          const { data } = await supabase
            .from('orders')
            .select('id')
            .eq('user_email', cleanEmail)
            .eq('payment_status', 'paid')
            .limit(1);
          if (data && data.length > 0) hasAnyPaidOrder = true;
        }
      }

      if (hasAnyPaidOrder) {
        return NextResponse.json({ used: true, error: 'This coupon is only valid for your first order.' });
      }
    }

    let hasPriorOrder = false;

    // 1. Check by userId if provided
    if (userId) {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('coupon_code', code)
        .eq('payment_status', 'paid')
        .limit(1);
      
      if (data && data.length > 0) hasPriorOrder = true;
    }

    // 2. Check by email if provided and not already found
    if (email && !hasPriorOrder) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail.includes('@')) {
        const { data } = await supabase
          .from('orders')
          .select('id')
          .eq('user_email', cleanEmail)
          .eq('coupon_code', code)
          .eq('payment_status', 'paid')
          .limit(1);
        
        if (data && data.length > 0) hasPriorOrder = true;
      }
    }

    return NextResponse.json({ used: hasPriorOrder });

  } catch (error: any) {
    console.error('Server coupon verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify coupon history' },
      { status: 500 }
    );
  }
}
