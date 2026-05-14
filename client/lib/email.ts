import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/phonepe'; // We can reuse the admin client from here
import { createClient } from '@supabase/supabase-js';

// Use admin client to ensure we have access to analytics_logs and orders
// If getSupabaseAdmin is not suitable, we can create a local one
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Note: We use the service key if available, otherwise fallback to anon key (which might fail if RLS is strict, 
// but since webhook context uses getSupabaseAdmin, we should just export/import it from there)

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_SMTP_PASSWORD || '',
  },
});

export async function sendOwnerNotification(orderId: string) {
  try {
    // 1. Verify SMTP is configured
    if (!process.env.RESEND_SMTP_PASSWORD) {
      console.warn('sendOwnerNotification: RESEND_SMTP_PASSWORD not configured. Skipping email.');
      return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@grainzzindia.com';
    const owners = ['katariavibhor9@gmail.com', 'rishelpuri@gmail.com'];

    // Get the supabase admin client (it has service role capabilities)
    const supabase = getSupabaseAdmin();

    // 2. Idempotency Check
    const { data: existingLog, error: logError } = await supabase
      .from('analytics_logs')
      .select('id')
      .eq('event_type', 'owner_order_notification_sent')
      .contains('event_data', { order_id: orderId })
      .maybeSingle();

    if (logError && logError.code !== 'PGRST116') {
      console.error('sendOwnerNotification: Error checking analytics_logs:', logError);
    }

    if (existingLog) {
      console.log(`sendOwnerNotification: Notification already sent for order ${orderId}. Skipping.`);
      return;
    }

    // 3. Fetch Order Details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error(`sendOwnerNotification: Error fetching order ${orderId}:`, orderError);
      return;
    }

    if (order.payment_status !== 'paid') {
      console.log(`sendOwnerNotification: Order ${orderId} payment_status is '${order.payment_status}', not 'paid'. Skipping.`);
      return;
    }

    // 4. Fetch Order Items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('name, quantity, price')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`sendOwnerNotification: Error fetching order items for ${orderId}:`, itemsError);
      // We continue even if items fail, to ensure the owner still gets the main order notification
    }

    // 5. Build HTML Email
    const adminUrl = process.env.ADMIN_URL || 'https://admin.grainzzindia.com';
    const orderLink = `${adminUrl}/dashboard/orders`;

    const itemsHtml = (orderItems || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>`
      )
      .join('');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2e7d32;">New Paid Order Received!</h2>
        <p>A new order has been successfully paid and is ready for processing.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Customer Name:</strong> ${order.user_name || 'N/A'}</p>
          <p><strong>Customer Phone:</strong> ${order.user_phone || 'N/A'}</p>
          <p><strong>Customer Email:</strong> ${order.user_email || 'N/A'}</p>
          <p><strong>Total Amount:</strong> ₹${order.total_amount || 0}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
          <p><strong>Payment Status:</strong> ${order.payment_status}</p>
          <p><strong>Paid At:</strong> ${order.paid_at ? new Date(order.paid_at).toLocaleString() : 'N/A'}</p>
          <p><strong>Transaction ID:</strong> ${order.transaction_id || 'N/A'}</p>
          <p><strong>Payment Ref:</strong> ${order.payment_reference || 'N/A'}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        </div>

        <h3 style="margin-top: 30px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="3" style="text-align:center; padding:10px;">No items found</td></tr>'}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 40px;">
          <a href="${orderLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            View Orders in Admin Panel
          </a>
        </div>
      </div>
    `;

    // 6. Send Emails
    const info = await transporter.sendMail({
      from: `"Grainzz Notifications" <${fromEmail}>`,
      to: owners,
      subject: `New Paid Order Received – Order #${order.id}`,
      html: htmlBody,
    });

    console.log(`sendOwnerNotification: Email sent for order ${orderId}. MessageId: ${info.messageId}`);

    // 7. Insert Analytics Log to prevent duplicates
    await supabase.from('analytics_logs').insert({
      event_type: 'owner_order_notification_sent',
      event_data: {
        order_id: orderId,
        recipients: owners,
        payment_status: order.payment_status,
        sent_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    // We strictly catch all errors so it never throws and breaks the webhook flow
    console.error('sendOwnerNotification: Unexpected error:', error);
  }
}
