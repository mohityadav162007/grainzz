// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Shiprocket Webhook received:', JSON.stringify(body, null, 2));

    const { 
      awb, 
      current_status, 
      shipment_id, 
      order_id: srOrderId,
      current_timestamp,
      status
    } = body;

    if (!awb && !shipment_id) {
      return new Response(JSON.stringify({ error: 'Missing AWB or Shipment ID' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Map Shiprocket status to our internal status
    const rawStatus = (current_status || status || '').toString().toLowerCase();
    let deliveryStatus = current_status || status || 'Updated';
    let orderStatus = '';

    if (rawStatus.includes('delivered')) {
      deliveryStatus = 'Delivered';
      orderStatus = 'delivered';
    } else if (rawStatus.includes('out for delivery')) {
      deliveryStatus = 'Out For Delivery';
    } else if (rawStatus.includes('shipped') || rawStatus.includes('transit') || rawStatus.includes('manifest')) {
      deliveryStatus = 'Shipped';
      orderStatus = 'shipped';
    } else if (rawStatus.includes('pickup') || rawStatus.includes('ready')) {
      deliveryStatus = 'Ready for Pickup';
    } else if (rawStatus.includes('cancel') || rawStatus.includes('rto')) {
      deliveryStatus = 'Cancelled';
      orderStatus = 'cancelled';
    }

    // Find the order in our database
    // We try by AWB first, then Shipment ID
    let query = supabase.from('orders').select('id, status, delivery_status');
    
    if (awb) {
      query = query.eq('awb_code', awb);
    } else {
      query = query.eq('shipment_id', shipment_id.toString());
    }

    const { data: order, error: fetchError } = await query.maybeSingle();

    if (fetchError || !order) {
      console.error('Order not found for webhook:', { awb, shipment_id });
      // Log it to analytics for debugging
      await supabase.from('analytics_logs').insert({
        event_type: 'shiprocket_webhook_orphan',
        event_data: body
      });
      
      return new Response(JSON.stringify({ success: false, message: 'Order not found' }), { 
        status: 200, // Return 200 so Shiprocket doesn't retry infinitely if order is gone
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Update the order
    const updates: any = {
      delivery_status: deliveryStatus,
      shipment_status: rawStatus.toUpperCase(),
      updated_at: new Date().toISOString()
    };

    if (orderStatus && orderStatus !== order.status) {
      updates.status = orderStatus;
    }

    if (rawStatus.includes('shipped') && !order.shipped_at) {
      updates.shipped_at = current_timestamp || new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // Log the success
    await supabase.from('analytics_logs').insert({
      event_type: 'shiprocket_webhook_success',
      event_data: {
        order_id: order.id,
        awb,
        old_status: order.delivery_status,
        new_status: deliveryStatus,
        payload: body
      }
    });

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Shiprocket Webhook Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
