import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

async function getShiprocketToken(supabase: any): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expires_at > now + 5 * 60 * 1000) {
    return cachedToken.token;
  }

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
    } catch { /* expired */ }
  }

  // Fetch new token
  const response = await fetch(`${SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shiprocket auth failed (${response.status}): ${errText}`);
  }

  const tokenData = await response.json();
  const token = tokenData.token;
  if (!token) throw new Error('No token from Shiprocket login');

  const expires_at = now + 9 * 24 * 60 * 60 * 1000;
  cachedToken = { token, expires_at };

  const tokenJson = JSON.stringify({ token, expires_at });
  const { data: existing } = await supabase
    .from('store_settings').select('id').eq('key', 'shiprocket_auth_token').single();

  if (existing) {
    await supabase.from('store_settings').update({ value: tokenJson }).eq('key', 'shiprocket_auth_token');
  } else {
    await supabase.from('store_settings').insert({
      key: 'shiprocket_auth_token', value: tokenJson,
      description: 'Shiprocket auth token cache (auto-managed)',
    });
  }

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

serve(async (req) => {
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
      const results: any[] = [];
      const errors: any[] = [];

      for (const orderId of orderIds) {
        try {
          // 1. Fetch order + items from database
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

          if (orderError || !order) {
            errors.push({ orderId, error: 'Order not found' });
            continue;
          }

          // 2. Check if already sent
          if (order.is_sent_to_shiprocket) {
            errors.push({ orderId, error: 'Already sent to Shiprocket', alreadySent: true });
            continue;
          }

          // 3. Check if payment is confirmed
          if (order.payment_status !== 'paid') {
            errors.push({ orderId, error: 'Order payment not confirmed (status: ' + order.payment_status + ')' });
            continue;
          }

          // 4. Validate required fields
          const missingFields: string[] = [];
          if (!order.user_name) missingFields.push('customer name');
          if (!order.user_phone) missingFields.push('phone');
          if (!order.user_address) missingFields.push('address');
          if (!order.user_pincode) missingFields.push('pincode');
          if (!order.order_items || order.order_items.length === 0) missingFields.push('order items');

          if (missingFields.length > 0) {
            errors.push({ orderId, error: `Missing required fields: ${missingFields.join(', ')}` });
            continue;
          }

          // 5. Build Shiprocket order payload
          const orderItems = order.order_items.map((item: any) => ({
            name: item.name,
            sku: item.product_id || `SKU-${item.name?.replace(/\s+/g, '-').substring(0, 20)}`,
            units: item.quantity,
            selling_price: Number(item.price),
            discount: '',
            tax: '',
            hsn: '',
          }));

          // Split name into first/last
          const nameParts = order.user_name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || firstName;

          const shiprocketPayload = {
            order_id: order.id.substring(0, 20), // Shiprocket has char limits
            order_date: formatDate(order.created_at),
            pickup_location: 'Primary', // Uses the default pickup address configured in Shiprocket
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
            length: 20,
            breadth: 15,
            height: 10,
            weight: 0.5,
          };

          // 6. Send to Shiprocket API
          const shiprocketResponse = await fetch(
            `${SHIPROCKET_BASE_URL}/v1/external/orders/create/adhoc`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(shiprocketPayload),
            }
          );

          const shiprocketData = await shiprocketResponse.json();

          await logEvent(supabase, 'shiprocket_create_order', {
            orderId,
            payload: shiprocketPayload,
            response: shiprocketData,
            status: shiprocketResponse.status,
          });

          if (!shiprocketResponse.ok || shiprocketData.status_code === 0) {
            const errorMsg = shiprocketData.message || shiprocketData.errors || `Shiprocket API error (${shiprocketResponse.status})`;
            errors.push({ orderId, error: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
            continue;
          }

          // 7. Extract returned data
          const srOrderId = shiprocketData.order_id?.toString() || '';
          const srShipmentId = shiprocketData.shipment_id?.toString() || '';
          const srAwbCode = shiprocketData.awb_code || '';
          const srCourierName = shiprocketData.courier_name || '';
          const srStatus = shiprocketData.status || 'NEW';

          // 8. Update order in database
          const updatePayload: any = {
            is_sent_to_shiprocket: true,
            shiprocket_order_id: srOrderId,
            shipment_id: srShipmentId,
            shipment_status: srStatus,
            status: 'processing',
          };

          if (srAwbCode) {
            updatePayload.awb_code = srAwbCode;
            updatePayload.courier_name = srCourierName;
            updatePayload.tracking_url = `https://shiprocket.co/tracking/${srAwbCode}`;
          }

          await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId);

          results.push({
            orderId,
            success: true,
            shiprocket_order_id: srOrderId,
            shipment_id: srShipmentId,
            awb_code: srAwbCode,
            courier_name: srCourierName,
            status: srStatus,
          });

        } catch (orderErr: any) {
          errors.push({ orderId, error: orderErr.message });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results, errors, total: orderIds.length, shipped: results.length, failed: errors.length }),
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

      // First get courier serviceability
      const courierResponse = await fetch(
        `${SHIPROCKET_BASE_URL}/v1/external/courier/assign/awb`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ shipment_id: shipmentId }),
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
        // Update in database
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
      });

      const trackData = await trackResponse.json();

      if (!trackResponse.ok) {
        return new Response(
          JSON.stringify({ error: trackData.message || 'Tracking API error' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract delivery status from tracking data
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
    // SYNC TRACKING — Bulk update tracking statuses for active shipments
    // ═══════════════════════════════════════════════════════════════════

    if (action === 'sync-tracking') {
      // Fetch all orders that are sent to Shiprocket but not yet delivered
      const { data: activeOrders, error: fetchError } = await supabase
        .from('orders')
        .select('id, awb_code, shipment_id, delivery_status')
        .eq('is_sent_to_shiprocket', true)
        .not('delivery_status', 'in', '("Delivered","Cancelled","RTO")');

      if (fetchError) {
        throw new Error(`Failed to fetch active orders: ${fetchError.message}`);
      }

      if (!activeOrders || activeOrders.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No active shipments to sync', updated: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getShiprocketToken(supabase);
      let updatedCount = 0;

      for (const order of activeOrders) {
        try {
          if (!order.awb_code && !order.shipment_id) continue;

          let trackUrl = '';
          if (order.awb_code) {
            trackUrl = `${SHIPROCKET_BASE_URL}/v1/external/courier/track/awb/${order.awb_code}`;
          } else {
            trackUrl = `${SHIPROCKET_BASE_URL}/v1/external/courier/track/shipment/${order.shipment_id}`;
          }

          const resp = await fetch(trackUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          });

          if (!resp.ok) continue;

          const trackData = await resp.json();
          const trackingInfo = trackData.tracking_data || trackData;

          // Map Shiprocket statuses to our delivery statuses
          let deliveryStatus = '';
          let shipmentStatus = '';
          let orderStatus = '';

          const srStatus = (trackingInfo.track_status || trackingInfo.shipment_status || '').toString();
          const srStatusNum = parseInt(srStatus);

          if (srStatusNum === 6 || srStatus.toLowerCase().includes('delivered')) {
            deliveryStatus = 'Delivered';
            shipmentStatus = 'DELIVERED';
            orderStatus = 'delivered';
          } else if (srStatusNum === 18 || srStatus.toLowerCase().includes('out for delivery')) {
            deliveryStatus = 'Out For Delivery';
            shipmentStatus = 'OUT_FOR_DELIVERY';
          } else if (srStatusNum === 17 || srStatus.toLowerCase().includes('in transit') || srStatusNum === 7) {
            deliveryStatus = 'In Transit';
            shipmentStatus = 'IN_TRANSIT';
          } else if (srStatusNum === 8 || srStatus.toLowerCase().includes('shipped')) {
            deliveryStatus = 'Shipped';
            shipmentStatus = 'SHIPPED';
            orderStatus = 'shipped';
          } else if (srStatusNum === 9 || srStatus.toLowerCase().includes('cancel') || srStatus.toLowerCase().includes('rto')) {
            deliveryStatus = 'Cancelled';
            shipmentStatus = 'CANCELLED';
          } else if (srStatus) {
            deliveryStatus = srStatus;
            shipmentStatus = srStatus.toUpperCase().replace(/\s+/g, '_');
          }

          if (deliveryStatus && deliveryStatus !== order.delivery_status) {
            const update: any = { delivery_status: deliveryStatus, shipment_status: shipmentStatus };
            if (orderStatus) update.status = orderStatus;
            if (deliveryStatus === 'Shipped' && !order.shipped_at) {
              update.shipped_at = new Date().toISOString();
            }

            await supabase.from('orders').update(update).eq('id', order.id);
            updatedCount++;
          }
        } catch (err) {
          console.error(`Failed to sync tracking for order ${order.id}:`, err);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: `Synced ${updatedCount} orders`, updated: updatedCount, total: activeOrders.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      JSON.stringify({ error: 'Invalid action. Use: create-shipment, request-awb, track, sync-tracking, cancel' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('shiprocket-orders error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
