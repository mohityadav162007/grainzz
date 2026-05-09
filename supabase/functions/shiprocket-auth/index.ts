// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

declare const Deno: any;

// ─── Configuration ───────────────────────────────────────────────────────────

const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL') || '';
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD') || '';
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

let cachedToken: { token: string; expires_at: number } | null = null;

// ─── Token Management ────────────────────────────────────────────────────────

async function getShiprocketToken(supabase: any): Promise<string> {
  const now = Date.now();

  // 1. Check in-memory cache (valid if not expiring within 5 minutes)
  if (cachedToken && cachedToken.expires_at > now + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  // 2. Check database cache
  const { data: cached } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'shiprocket_auth_token')
    .single();

  if (cached?.value) {
    try {
      const parsed = JSON.parse(cached.value);
      if (parsed.expires_at && parsed.expires_at > now + 5 * 60 * 1000) {
        cachedToken = parsed;
        return parsed.token;
      }
    } catch {
      // expired or invalid, proceed to fetch new
    }
  }

  // 3. Fetch a new token from Shiprocket
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error('Shiprocket credentials not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in Supabase secrets.');
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shiprocket auth failed (${response.status}): ${errText}`);
  }

  const tokenData = await response.json();
  const token = tokenData.token;

  if (!token) {
    throw new Error('No token received from Shiprocket login API');
  }

  // Shiprocket tokens are valid for 10 days (864000 seconds)
  const expires_at = now + 9 * 24 * 60 * 60 * 1000; // 9 days to be safe

  cachedToken = { token, expires_at };

  // 4. Persist to database
  const tokenJson = JSON.stringify({ token, expires_at });
  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .eq('key', 'shiprocket_auth_token')
    .single();

  if (existing) {
    await supabase.from('store_settings').update({ value: tokenJson }).eq('key', 'shiprocket_auth_token');
  } else {
    await supabase.from('store_settings').insert({
      key: 'shiprocket_auth_token',
      value: tokenJson,
      description: 'Shiprocket auth token cache (auto-managed)',
    });
  }

  return token;
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

    // ─── GET TOKEN ──────────────────────────────────────────────────────

    if (action === 'get-token') {
      const token = await getShiprocketToken(supabase);
      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── REFRESH TOKEN (force) ──────────────────────────────────────────

    if (action === 'refresh-token') {
      // Invalidate cache
      cachedToken = null;
      await supabase.from('store_settings').delete().eq('key', 'shiprocket_auth_token');

      const token = await getShiprocketToken(supabase);
      return new Response(
        JSON.stringify({ success: true, token, message: 'Token refreshed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "get-token" or "refresh-token".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('shiprocket-auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
