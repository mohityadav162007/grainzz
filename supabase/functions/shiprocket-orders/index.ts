// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { calculateAggregatedPackage } from './shipping.ts';

declare const Deno: any;

// ─── Configuration ───────────────────────────────────────────────────────────

const SHIPROCKET_EMAIL = Deno.env.get('SHIPROCKET_EMAIL') || '';
const SHIPROCKET_PASSWORD = Deno.env.get('SHIPROCKET_PASSWORD') || '';
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Token Cache (same pattern as shiprocket-auth) ───────────────────────────

let cachedToken: { token: string; expires_at: number } | null = null;

async function getShiprocketToken(supabase: any, forceRefresh = false): Promise<string> {
  const now = Date.now();

  // 1. Handle Forced Refresh
  if (forceRefresh) {
    console.log('Forcing Shiprocket token refresh...');
    cachedToken = null;
    await supabase.from('store_settings').delete().eq('key', 'shiprocket_auth_token');
  } else {
    // 2. Check in-memory cache
    if (cachedToken && cachedToken.expires_at > now + 5 * 60 * 1000) {
      return cachedToken.token;
    }

    // 3. Check DB cache
    try {
      const { data: cached } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'shiprocket_auth_token')
        .single();

      if (cached?.value) {
        const parsed = JSON.parse(cached.value);
        if (parsed.expires_at && parsed.expires_at > now + 5 * 60 * 1000) {
          cachedToken = parsed;
          return parsed.token;
        }
      }
    } catch { /* Cache miss or parse error — continue to fetch */ }
  }

  // 4. Fetch new token from Shiprocket
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error('Shiprocket credentials (SHIPROCKET_EMAIL/PASSWORD) not configured in Edge Function secrets.');
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Shiprocket Login Failed:', errText);
    throw new Error(`Shiprocket auth failed (${response.status}): ${errText}`);
  }

  const tokenData = await response.json();
  const token = tokenData.token;
  if (!token) throw new Error('No token in Shiprocket login response');

  const expires_at = now + 9 * 24 * 60 * 60 * 1000; // 9 days
  cachedToken = { token, expires_at };

  // Cache in DB (non-blocking)
  const tokenJson = JSON.stringify({ token, expires_at });
  supabase.from('store_settings')
    .upsert({ key: 'shiprocket_auth_token', value: tokenJson, description: 'Shiprocket auth token cache (auto-managed)' })
    .then(() => {});

  return token;
}

// ─── Helper: Generate order date string ──────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// ─── Helper: Log events ─────────────────────────────────────────────────────

async function logEvent(supabase: any, type: string, data: any) {
  try {
    await supabase.from('analytics_logs').insert({ event_type: type, event_data: data });
  } catch (e) {
    console.error('Failed to log event', e);
  }
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

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    console.log(`Shiprocket Action: ${action || 'None'}`);

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // CHECK SERVICEABILITY — Get shipping rates for a destination
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'check-serviceability') {
      const { delivery_pincode, weight, subtotal, has_combo, length, breadth, height } = body;

      if (!delivery_pincode) {
        return new Response(
          JSON.stringify({ error: 'Missing delivery_pincode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Read shipping config from store_settings
      const { data: settings } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', [
          'shiprocket_pickup_pincode',
          'free_shipping_enabled',
          'free_shipping_threshold',
          'fallback_shipping_charge_single',
          'fallback_shipping_charge_combo',
        ]);

      const cfg: Record<string, string> = {};
      (settings || []).forEach((s: any) => { cfg[s.key] = s.value; });

      const pickupPincode = cfg.shiprocket_pickup_pincode || '110093';
      const freeShippingEnabled = cfg.free_shipping_enabled !== 'false';
      const freeShippingThreshold = Number(cfg.free_shipping_threshold) || 499;
      const fallbackSingle = Number(cfg.fallback_shipping_charge_single) || 50;
      const fallbackCombo = Number(cfg.fallback_shipping_charge_combo) || 99;
      const fallbackCharge = has_combo ? fallbackCombo : fallbackSingle;
      const pickupLocation = cfg.shiprocket_pickup_location || 'Primary';

      // Check free shipping first
      const cartSubtotal = Number(subtotal) || 0;
      if (freeShippingEnabled && cartSubtotal >= freeShippingThreshold) {
        return new Response(
          JSON.stringify({
            success: true,
            serviceable: true,
            shipping_charge: 0,
            estimated_delivery: '',
            courier_name: '',
            free_shipping: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch rates from Shiprocket
      try {
        const token = await getShiprocketToken(supabase);
        const packageWeight = Number(weight) || 0.5;
        const packageLength = Number(length) || 15;
        const packageBreadth = Number(breadth) || 15;
        const packageHeight = Number(height) || 10;

        const volumetricWeight = (packageLength * packageBreadth * packageHeight) / 5000;
        const applicableWeight = Math.max(packageWeight, volumetricWeight);

        console.log(`[SHIPROCKET RATE ESTIMATION]
          Delivery Pincode: ${delivery_pincode}
          Origin Pincode: ${pickupPincode}
          Calculated Dimensions: Length=${packageLength} cm, Breadth=${packageBreadth} cm, Height=${packageHeight} cm
          Actual Weight: ${packageWeight} kg
          Volumetric Weight: ${volumetricWeight.toFixed(4)} kg
          Applicable Weight: ${applicableWeight.toFixed(4)} kg
        `);

        // Use standard serviceability endpoint
        const srUrl = `${SHIPROCKET_BASE_URL}/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${delivery_pincode}&weight=${packageWeight}&cod=0&length=${packageLength}&breadth=${packageBreadth}&height=${packageHeight}`;

        console.log(`Requesting Shiprocket Rates: ${srUrl}`);

        const srResponse = await fetch(srUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(8000), // 8s timeout
        });

        if (!srResponse.ok) {
          const errText = await srResponse.text();
          throw new Error(`Shiprocket API error (${srResponse.status}): ${errText}`);
        }

        const srData = await srResponse.json();
        const couriers = srData?.data?.available_courier_companies || [];

        if (couriers.length === 0) {
          console.warn(`No couriers found for pincode ${delivery_pincode}. Using fallback.`);
          return new Response(
            JSON.stringify({
              success: true,
              serviceable: false,
              shipping_charge: fallbackCharge,
              estimated_delivery: '',
              courier_name: '',
              free_shipping: false,
              fallback: true,
              message: 'No couriers available for this location',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Find cheapest courier
        const cheapest = couriers.reduce((min: any, c: any) => {
          const rate = Number(c.freight_charge || c.rate || 0);
          const minRate = Number(min.freight_charge || min.rate || 0);
          return rate < minRate ? c : min;
        }, couriers[0]);

        const shippingCharge = Math.ceil(Number(cheapest.freight_charge || cheapest.rate || 0));
        const etd = cheapest.etd || cheapest.estimated_delivery_days || '';
        const courierName = cheapest.courier_name || '';

        return new Response(
          JSON.stringify({
            success: true,
            serviceable: true,
            shipping_charge: shippingCharge,
            estimated_delivery: etd,
            courier_name: courierName,
            free_shipping: false,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (srError: any) {
        console.error('Shiprocket serviceability error:', srError);
        // Failsafe: return fallback charge
        return new Response(
          JSON.stringify({
            success: true,
            serviceable: true,
            shipping_charge: fallbackCharge,
            estimated_delivery: '',
            courier_name: '',
            free_shipping: false,
            fallback: true,
            fallback_reason: srError.message,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // CREATE SHIPMENT — Send orders to Shiprocket
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'create-shipment') {
      const { orderIds } = body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No order IDs provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getShiprocketToken(supabase);
      
      // Fetch pickup location from settings
      const { data: pickupSetting } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'shiprocket_pickup_location')
        .single();
      const pickupLocation = pickupSetting?.value || 'Primary';

      const results: any[] = [];
      const errors: any[] = [];

      for (const orderId of orderIds) {
        try {
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

          if (orderError || !order) {
            errors.push({ orderId, error: 'Order not found' });
            continue;
          }

          if (order.is_sent_to_shiprocket) {
            errors.push({ orderId, error: 'Already sent to Shiprocket', alreadySent: true });
            continue;
          }

          if (order.payment_status !== 'paid') {
            errors.push({ orderId, error: 'Order payment not confirmed (status: ' + order.payment_status + ')' });
            continue;
          }

          const orderItems = order.order_items.map((item: any) => ({
            name: item.name,
            sku: item.product_id || `SKU-${item.name?.replace(/\s+/g, '-').substring(0, 20)}`,
            units: item.quantity,
            selling_price: Number(item.price),
          }));

          // ── Fetch per-product package dimensions ──
          const productIds = order.order_items
            .map((item: any) => item.product_id)
            .filter(Boolean);

          const qtyMap: Record<string, number> = {};
          order.order_items.forEach((item: any) => {
            if (item.product_id) qtyMap[item.product_id] = (qtyMap[item.product_id] || 0) + item.quantity;
          });

          let pkgItems: any[] = [];
          if (productIds.length > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('id, package_length, package_breadth, package_height, package_weight')
              .in('id', productIds);

            if (products && products.length > 0) {
              pkgItems = products.map((p: any) => ({
                package_length: p.package_length,
                package_breadth: p.package_breadth,
                package_height: p.package_height,
                package_weight: p.package_weight,
                quantity: qtyMap[p.id] || 1,
              }));
            }
          }

          const pkg = calculateAggregatedPackage(pkgItems);
          const pkgLength = pkg.length;
          const pkgBreadth = pkg.breadth;
          const pkgHeight = pkg.height;
          const pkgWeight = pkg.weight;

          const nameParts = order.user_name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || firstName;

          const srShortId = `GRZ-${order.id.substring(0, 8)}-${Date.now().toString().slice(-4)}`;

          const shiprocketPayload = {
            order_id: srShortId,
            order_date: formatDate(order.created_at),
            pickup_location: pickupLocation,
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: order.user_address,
            billing_address_2: '',
            billing_city: order.user_city || 'NA',
            billing_pincode: order.user_pincode,
            billing_state: order.user_state || 'NA',
            billing_country: 'India',
            billing_email: order.user_email || '',
            billing_phone: order.user_phone.replace(/\D/g, '').slice(-10),
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: 'Prepaid',
            sub_total: Number(order.total_amount),
            length: pkgLength,
            breadth: pkgBreadth,
            height: pkgHeight,
            weight: pkgWeight,
          };

          console.log(`[SHIPROCKET ORDER CREATION]
            Order ID: ${orderId}
            Number of Items: ${order.order_items.length}
            Calculated Dimensions: Length=${pkg.length} cm, Breadth=${pkg.breadth} cm, Height=${pkg.height} cm
            Actual Weight: ${pkg.weight} kg
            Volumetric Weight: ${pkg.volumetric_weight} kg
            Applicable Weight: ${pkg.applicable_weight} kg
            Final Payload Sent to Shiprocket: ${JSON.stringify(shiprocketPayload, null, 2)}
          `);

          let shiprocketResponse = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(shiprocketPayload),
            signal: AbortSignal.timeout(10000),
          });

          let shiprocketData = await shiprocketResponse.json();

          // RETRY LOGIC: If token expired, refresh once and retry
          if (shiprocketData.message?.toLowerCase().includes('token') && shiprocketData.message?.toLowerCase().includes('expire')) {
            console.log('Token expired during creation, refreshing...');
            const freshToken = await getShiprocketToken(supabase, true);
            shiprocketResponse = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`,
              },
              body: JSON.stringify(shiprocketPayload),
              signal: AbortSignal.timeout(10000),
            });
            shiprocketData = await shiprocketResponse.json();
          }

          await logEvent(supabase, 'shiprocket_create_order', {
            orderId,
            itemsCount: order.order_items.length,
            calculatedPackage: pkg,
            payload: shiprocketPayload,
            response: shiprocketData,
          });

          if (!shiprocketResponse.ok || shiprocketData.status_code !== 1) {
            const errorMsg = shiprocketData.message || shiprocketData.errors || `Shiprocket API error`;
            console.error(`Shiprocket Creation Failed for Order ${orderId}:`, JSON.stringify(shiprocketData));
            errors.push({ orderId, error: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
            continue;
          }

          const srOrderId = shiprocketData.order_id?.toString() || '';
          const srShipmentId = shiprocketData.shipment_id?.toString() || '';
          const srAwbCode = shiprocketData.awb_code || '';
          const srStatus = shiprocketData.status || 'NEW';

          const updatePayload: any = {
            is_sent_to_shiprocket: true,
            shiprocket_order_id: srOrderId,
            shipment_id: srShipmentId,
            shipment_status: srStatus,
            status: 'processing',
          };

          if (srAwbCode) {
            updatePayload.awb_code = srAwbCode;
            updatePayload.tracking_url = `https://shiprocket.co/tracking/${srAwbCode}`;
          }

          await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId);

          results.push({ orderId, success: true, srOrderId, srShipmentId });

        } catch (orderErr: any) {
          errors.push({ orderId, error: orderErr.message });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          results, 
          errors, 
          total: orderIds.length,
          shipped: results.length,
          failed: errors.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // REQUEST AWB — Assign courier and generate AWB for a shipment
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'request-awb') {
      const { shipmentId } = body;

      if (!shipmentId) {
        return new Response(
          JSON.stringify({ error: 'Missing shipment_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getShiprocketToken(supabase);

      const courierResponse = await fetch(
        `${SHIPROCKET_BASE_URL}/v1/external/courier/assign/awb`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ shipment_id: shipmentId }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const courierData = await courierResponse.json();

      await logEvent(supabase, 'shiprocket_assign_awb', { shipmentId, response: courierData });

      if (!courierResponse.ok) {
        return new Response(
          JSON.stringify({ error: courierData.message || 'Failed to assign AWB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const awbCode = courierData.response?.data?.awb_code || '';
      const courierName = courierData.response?.data?.courier_name || '';

      if (awbCode) {
        await supabase
          .from('orders')
          .update({
            awb_code: awbCode,
            courier_name: courierName,
            tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
            shipment_status: 'AWB_ASSIGNED',
          })
          .eq('shipment_id', shipmentId);
      }

      return new Response(
        JSON.stringify({ success: true, awb_code: awbCode, courier_name: courierName }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // TRACK SHIPMENT — Get tracking info for an AWB/shipment
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'track') {
      const { awbCode, shipmentId } = body;

      if (!awbCode && !shipmentId) {
        return new Response(
          JSON.stringify({ error: 'Provide awbCode or shipmentId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getShiprocketToken(supabase);

      let trackingUrl = '';
      if (awbCode) {
        trackingUrl = `${SHIPROCKET_BASE_URL}/v1/external/courier/track/awb/${awbCode}`;
      } else {
        trackingUrl = `${SHIPROCKET_BASE_URL}/v1/external/courier/track/shipment/${shipmentId}`;
      }

      const trackResponse = await fetch(trackingUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      const trackData = await trackResponse.json();

      if (!trackResponse.ok) {
        return new Response(
          JSON.stringify({ error: trackData.message || 'Tracking API error' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const trackingInfo = trackData.tracking_data || trackData;
      const currentStatus = trackingInfo.track_status || trackingInfo.shipment_status || '';
      const currentActivity = trackingInfo.shipment_track_activities || [];

      return new Response(
        JSON.stringify({
          success: true,
          tracking: {
            current_status: currentStatus,
            activities: currentActivity,
            raw: trackingInfo,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // SYNC TRACKING — Bulk update tracking statuses
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'sync-tracking') {
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('id, awb_code, shipment_id, delivery_status')
        .eq('is_sent_to_shiprocket', true)
        .not('delivery_status', 'in', '("Delivered","Cancelled","RTO")');

      if (!activeOrders || activeOrders.length === 0) {
        return new Response(JSON.stringify({ success: true, updated: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const token = await getShiprocketToken(supabase);
      let updatedCount = 0;

      for (const order of activeOrders) {
        try {
          if (!order.awb_code && !order.shipment_id) continue;

          const trackUrl = order.awb_code 
            ? `${SHIPROCKET_BASE_URL}/v1/external/courier/track/awb/${order.awb_code}`
            : `${SHIPROCKET_BASE_URL}/v1/external/courier/track/shipment/${order.shipment_id}`;

          const resp = await fetch(trackUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(5000),
          });

          if (!resp.ok) continue;
          const trackData = await resp.json();
          const info = trackData.tracking_data || trackData;
          const status = (info.track_status || info.shipment_status || '').toString().toLowerCase();

          let deliveryStatus = '';
          let orderStatus = '';

          if (status.includes('delivered')) {
            deliveryStatus = 'Delivered';
            orderStatus = 'delivered';
          } else if (status.includes('out for delivery')) {
            deliveryStatus = 'Out For Delivery';
          } else if (status.includes('shipped') || status.includes('in transit') || status.includes('manifested')) {
            deliveryStatus = 'Shipped';
            orderStatus = 'shipped';
          } else if (status.includes('pickup') || status.includes('ready')) {
            deliveryStatus = 'Ready for Pickup';
          } else if (status.includes('cancel') || status.includes('rto')) {
            deliveryStatus = 'Cancelled';
            orderStatus = 'cancelled';
          }

          if (deliveryStatus && deliveryStatus !== order.delivery_status) {
            const update: any = { delivery_status: deliveryStatus };
            if (orderStatus) update.status = orderStatus;
            await supabase.from('orders').update(update).eq('id', order.id);
            updatedCount++;
          }
        } catch (e) { console.error(e); }
      }

      return new Response(JSON.stringify({ success: true, updated: updatedCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════════════
    // CANCEL SHIPMENT
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'cancel') {
      const { shiprocketOrderIds } = body;

      if (!shiprocketOrderIds || !Array.isArray(shiprocketOrderIds)) {
        return new Response(
          JSON.stringify({ error: 'Missing shiprocketOrderIds array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getShiprocketToken(supabase);

      const cancelResponse = await fetch(
        `${SHIPROCKET_BASE_URL}/v1/external/orders/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: shiprocketOrderIds }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const cancelData = await cancelResponse.json();

      await logEvent(supabase, 'shiprocket_cancel', { shiprocketOrderIds, response: cancelData });

      return new Response(
        JSON.stringify({ success: cancelResponse.ok, data: cancelData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Invalid action: ${action}. Use: check-serviceability, create-shipment, request-awb, track, sync-tracking, cancel` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('shiprocket-orders error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
