import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/phonepe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/coupons/verify
 * Query params: ?code=...&email=...&userId=...
 *
 * Verifies if a given coupon code has already been used by the user or email
 * in a successfully paid/processing/shipped/delivered order. Uses the Supabase
 * service role key to bypass RLS (needed for guest users querying the orders table).
 */

/** Returns true if the query yielded at least one order matching the filter. */
async function hasOrder(supabase: ReturnType<typeof getSupabaseAdmin>, filter: Record<string, string>): Promise<boolean> {
  let query = supabase.from('orders').select('id').limit(1);
  for (const [key, val] of Object.entries(filter)) {
    query = (query as any).eq(key, val);
  }
  // Broaden to match any of: payment_status='paid' OR status in meaningful statuses
  // We achieve this by OR-ing conditions at the PostgREST level.
  // Since filter already narrows by user/email and optionally coupon_code,
  // we additionally filter for any active/paid-like status.
  const { data } = await (query as any).or(
    'payment_status.eq.paid,status.eq.paid,status.eq.processing,status.eq.shipped,status.eq.delivered'
  );
  return Array.isArray(data) && data.length > 0;
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const email = req.nextUrl.searchParams.get('email');
    const userId = req.nextUrl.searchParams.get('userId');

    // Basic validation – code must be alphanumeric, 3-20 chars
    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 });
    }
    const codePattern = /^[A-Z0-9]{3,20}$/i;
    if (!codePattern.test(code)) {
      return NextResponse.json({ error: 'Invalid coupon code format' }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // If neither email nor userId is provided, we can't verify history, so assume unused.
    if (!email && !userId) {
      return NextResponse.json({ used: false });
    }

    const supabase = getSupabaseAdmin();

    // ── 1. First-order-only check ────────────────────────────────────────────
    const { data: couponData } = await supabase
      .from('coupons')
      .select('is_first_order_only')
      .eq('code', code.toUpperCase())
      .single();

    if (couponData?.is_first_order_only) {
      let hasAnyOrder = false;

      if (userId) {
        hasAnyOrder = await hasOrder(supabase, { user_id: userId });
      }

      if (!hasAnyOrder && email) {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail.includes('@')) {
          hasAnyOrder = await hasOrder(supabase, { user_email: cleanEmail });
        }
      }

      if (hasAnyOrder) {
        return NextResponse.json({
          used: true,
          error: 'This coupon is only valid for your first order.',
        });
      }
    }

    // ── 2. Coupon-already-used check ─────────────────────────────────────────
    let hasPriorUsage = false;

    if (userId) {
      hasPriorUsage = await hasOrder(supabase, { user_id: userId, coupon_code: code });
    }

    if (!hasPriorUsage && email) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail.includes('@')) {
        hasPriorUsage = await hasOrder(supabase, { user_email: cleanEmail, coupon_code: code });
      }
    }

    return NextResponse.json({ used: hasPriorUsage });

  } catch (error: any) {
    console.error('Server coupon verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify coupon history' },
      { status: 500 }
    );
  }
}
