// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'active', message: 'Order Notification function is live' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const { orderId } = body;

    console.log(`[ORDER NOTIFICATION] Received request for Order ID: ${orderId}`);

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1. Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error(`[ORDER NOTIFICATION] Order not found for ID: ${orderId}`, orderError);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[ORDER NOTIFICATION] Loaded order ${orderId} successfully. Items count: ${order.order_items?.length || 0}`);

    // Get Resend config from env
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL');

    if (!resendApiKey || !fromEmail) {
      console.error('[ORDER NOTIFICATION] Missing Resend environment configurations (RESEND_API_KEY or FROM_EMAIL)');
      return new Response(JSON.stringify({ error: 'Mail server configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Format details
    const orderDate = order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)' : 'N/A';
    
    // Status colors
    const payStatus = (order.payment_status || 'pending').toLowerCase();
    let payColor = '#eab308'; // Amber for pending
    if (payStatus === 'paid') payColor = '#22c55e'; // Green for paid
    if (payStatus === 'failed') payColor = '#ef4444'; // Red for failed

    const orderStatus = (order.status || 'pending').toLowerCase();
    let statusColor = '#3b82f6'; // Blue default
    if (orderStatus === 'cancelled') statusColor = '#ef4444';
    if (orderStatus === 'delivered') statusColor = '#22c55e';

    // 3. Build HTML Template
    const itemsHtml = (order.order_items || []).map((item: any) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      const total = price * qty;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155;">
            <strong>${item.name}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: center;">
            ${qty}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: right;">
            ₹${price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: bold; text-align: right;">
            ₹${total.toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #f97316;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">
                New Order Received
              </h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">
                Order ID: <span style="color: #f97316; font-weight: bold; font-family: monospace;">${order.id}</span>
              </p>
            </td>
          </tr>

          <!-- Customer & Shipment details -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                Customer & Shipping Information
              </h2>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.5; color: #475569;">
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; width: 130px; color: #334155;">Customer Name:</td>
                  <td style="padding: 4px 0; color: #0f172a;">${order.user_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">Phone Number:</td>
                  <td style="padding: 4px 0; color: #0f172a;">
                    <a href="tel:${order.user_phone}" style="color: #f97316; text-decoration: none; font-weight: 600;">${order.user_phone || 'N/A'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">Email Address:</td>
                  <td style="padding: 4px 0; color: #0f172a;">
                    <a href="mailto:${order.user_email}" style="color: #f97316; text-decoration: none;">${order.user_email || 'N/A'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; vertical-align: top; color: #334155;">Shipping Address:</td>
                  <td style="padding: 4px 0; color: #0f172a; line-height: 1.4;">
                    ${order.user_address || 'N/A'}<br>
                    ${order.user_city || 'N/A'}, ${order.user_state || 'N/A'} - ${order.user_pincode || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">Order Date:</td>
                  <td style="padding: 4px 0; color: #0f172a;">${orderDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Box -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
                <tr>
                  <td style="width: 50%; vertical-align: top;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Payment Status</span>
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase; background-color: ${payColor}20; color: ${payColor};">
                      ${order.payment_status || 'PENDING'}
                    </span>
                  </td>
                  <td style="width: 50%; vertical-align: top;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Order Status</span>
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 12px; text-transform: uppercase; background-color: ${statusColor}20; color: ${statusColor};">
                      ${order.status || 'PENDING'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-top: 0;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Payment Method</span>
                    <span style="font-weight: 600; color: #0f172a;">${order.payment_method || 'PhonePe'}</span>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-top: 0;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Transaction ID</span>
                    <span style="font-family: monospace; font-size: 13px; color: #0f172a;">${order.transaction_id || 'N/A'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                Ordered Items
              </h2>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; width: 60px;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; width: 100px;">Price</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; width: 100px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary / Financials -->
          <tr>
            <td style="padding: 0 24px 32px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" align="right" style="width: 100%; max-width: 320px; font-size: 14px; color: #475569; line-height: 2;">
                <tr>
                  <td style="padding: 4px 0; text-align: left; color: #64748b;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 600;">₹${(Number(order.subtotal) || 0).toFixed(2)}</td>
                </tr>
                ${order.coupon_code ? `
                <tr>
                  <td style="padding: 4px 0; text-align: left; color: #22c55e; font-weight: 600;">Coupon Discount (${order.coupon_code}):</td>
                  <td style="padding: 4px 0; text-align: right; color: #22c55e; font-weight: 600;">-₹${(Number(order.discount_amount) || 0).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 4px 0; text-align: left; color: #64748b;">Shipping Charge:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 600;">₹${(Number(order.shipping_charge) || 0).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: bold;">
                  <td style="padding: 12px 0 0 0; text-align: left; color: #0f172a;">Grand Total:</td>
                  <td style="padding: 12px 0 0 0; text-align: right; color: #f97316; font-size: 20px; font-weight: 800;">₹${(Number(order.total_amount) || 0).toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">This email is an automated order notification sent to the Grainzz Website Owners.</p>
              <p style="margin: 4px 0 0 0;">Please proceed with shipment preparation via the Admin Panel once payment is paid.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Trigger Resend API call
    console.log(`[ORDER NOTIFICATION] Sending email notification to both katariavibhor9@gmail.com and rishelpuri@gmail.com...`);
    const subject = `New Order Received - ₹${Number(order.total_amount).toFixed(0)} - ${order.payment_status || 'pending'}`;
    const recipients = ['katariavibhor9@gmail.com', 'rishelpuri@gmail.com'];

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: subject,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();
    console.log('[ORDER NOTIFICATION] Resend API Response Status:', resendResponse.status, JSON.stringify(resendData));

    if (!resendResponse.ok) {
      throw new Error(resendData.message || 'Failed to send email via Resend');
    }

    // Log tracking event in DB
    await supabase.from('analytics_logs').insert({
      event_type: 'order_notification_email_success',
      event_data: {
        orderId,
        recipients,
        subject,
        resend_email_id: resendData.id
      }
    }).catch((e) => console.error('Failed to log event:', e));

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully', resend_id: resendData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[ORDER NOTIFICATION] Error sending notification email:', error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
