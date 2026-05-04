import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID') || '';
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET') || '';
const PHONEPE_CLIENT_VERSION = Deno.env.get('PHONEPE_CLIENT_VERSION') || '1';
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for the current function invocation
let cachedToken: { access_token: string; expires_at: number } | null = null;

/**
 * Get a valid PhonePe OAuth token.
 * Checks in-memory cache first, then DB cache, then fetches a new one.
 */
async function getPhonePeToken(supabase: any): Promise<string> {
  const now = Date.now();

  // 1. Check in-memory cache
  if (cachedToken && cachedToken.expires_at > now + 60_000) {
    return cachedToken.access_token;
  }

  // 2. Check DB cache
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
      // Token invalid or expired, fetch new one
    }
  }

  // 3. Fetch new token from PhonePe
  const tokenResponse = await fetch(`${PHONEPE_BASE_URL}/v1/oauth/token`, {
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
    throw new Error(`PhonePe token request failed (${tokenResponse.status}): ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  const access_token = tokenData.access_token;
  const expires_in = tokenData.expires_in || 3600; // seconds
  const expires_at = now + expires_in * 1000;

  if (!access_token) {
    throw new Error('No access_token in PhonePe response');
  }

  // Cache in memory
  cachedToken = { access_token, expires_at };

  // Cache in DB (upsert)
  const tokenJson = JSON.stringify({ access_token, expires_at });
  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .eq('key', 'phonepe_auth_token')
    .single();

  if (existing) {
    await supabase
      .from('store_settings')
      .update({ value: tokenJson })
      .eq('key', 'phonepe_auth_token');
  } else {
    await supabase
      .from('store_settings')
      .insert({ key: 'phonepe_auth_token', value: tokenJson, description: 'PhonePe OAuth token cache' });
  }

  return access_token;
}

// Export for use by other functions
export { getPhonePeToken, PHONEPE_BASE_URL };

// Also serve as a standalone function for testing
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = await getPhonePeToken(supabase);

    return new Response(
      JSON.stringify({ success: true, data: { access_token: token } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
