/**
 * PhonePe Server-Side Token Service & Utilities
 * 
 * This module is SERVER-ONLY. Never import it from client components.
 * It manages OAuth2 token lifecycle, Supabase admin client, and status mapping.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Configuration ───────────────────────────────────────────────────────────

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || '';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '';
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const PHONEPE_TOKEN_URL = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PHONEPE_PG_BASE_URL = process.env.PHONEPE_PG_BASE_URL || 'https://api.phonepe.com/apis/pg';
const PHONEPE_WEBHOOK_SECRET = process.env.PHONEPE_WEBHOOK_SECRET || '';

export { PHONEPE_PG_BASE_URL, PHONEPE_WEBHOOK_SECRET };

// ─── Supabase Admin Client (Service Role) ────────────────────────────────────

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    supabaseAdmin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

// ─── Token Management ────────────────────────────────────────────────────────

let cachedToken: { access_token: string; expires_at: number } | null = null;

/**
 * Get a valid PhonePe OAuth2 access token.
 * Uses a 3-tier caching strategy:
 * 1. In-memory (fastest, survives within same Lambda/process)
 * 2. Supabase store_settings (survives across invocations)
 * 3. Fresh token from PhonePe (when both caches miss/expire)
 * 
 * Tokens are refreshed 60 seconds before actual expiry for safety.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const supabase = getSupabaseAdmin();

  // 1. Check in-memory cache
  if (cachedToken && cachedToken.expires_at > now + 60_000) {
    return cachedToken.access_token;
  }

  // 2. Check DB cache
  try {
    const { data: cached } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'phonepe_auth_token')
      .single();

    if (cached?.value) {
      const parsed = JSON.parse(cached.value);
      if (parsed.expires_at && parsed.expires_at > now + 60_000) {
        cachedToken = parsed;
        return parsed.access_token;
      }
    }
  } catch {
    // Cache miss or parse error — continue to fetch
  }

  // 3. Fetch new token from PhonePe
  if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
    throw new Error('PhonePe credentials not configured');
  }

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
    console.error('PhonePe token error:', errText);
    throw new Error(`PhonePe token request failed (${tokenResponse.status})`);
  }

  const tokenData = await tokenResponse.json();
  const access_token = tokenData.access_token;
  const expires_in = tokenData.expires_in || 3600;
  const expires_at = now + expires_in * 1000;

  if (!access_token) {
    throw new Error('No access_token in PhonePe token response');
  }

  // Cache in memory
  cachedToken = { access_token, expires_at };

  // Cache in DB (non-blocking — don't let DB failure break payment)
  try {
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
  } catch (e) {
    console.warn('Failed to cache PhonePe token in DB (non-critical):', e);
  }

  return access_token;
}

// ─── Status Mapping ──────────────────────────────────────────────────────────

export function mapPhonePeStatus(state: string): {
  payment_status: string;
  order_status: string;
} {
  switch (state) {
    case 'COMPLETED':
      return { payment_status: 'paid', order_status: 'paid' };
    case 'FAILED':
      return { payment_status: 'failed', order_status: 'cancelled' };
    case 'REFUND_COMPLETED':
      return { payment_status: 'refunded', order_status: 'refunded' };
    default:
      return { payment_status: 'pending', order_status: 'pending' };
  }
}

// ─── Logging Helper ──────────────────────────────────────────────────────────

export async function logPaymentEvent(type: string, data: any) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('analytics_logs').insert({
      event_type: type,
      event_data: data,
    });
  } catch (e) {
    console.error('Failed to log payment event:', e);
  }
}
