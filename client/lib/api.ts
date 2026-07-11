import { supabase } from './supabase';
 
 export const sendOTP = async (email: string) => {
   const { error } = await supabase.auth.resetPasswordForEmail(email);
   if (error) throw new Error(error.message);
   return { success: true };
 };
 
 export const verifyOTPAndSetPassword = async (email: string, token: string, newPassword: string) => {
   // 1. Verify OTP
   const { error: verifyError } = await supabase.auth.verifyOtp({
     email,
     token,
     type: 'recovery',
   });
   if (verifyError) throw new Error('Invalid or expired verification code');
 
   // 2. Update Password
   const { data, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
   if (updateError) throw new Error(updateError.message);
   return { success: true, data };
 };

const sanitizeImage = (url: string) => {
  if (!url) return '/image-2@2x.png';
  return url.includes('placeholder.jpg') ? '/image-2@2x.png' : url;
};

const sanitizeProduct = (product: any) => {
  if (!product) return null;
  if (Array.isArray(product.images)) {
    product.images = product.images.length > 0 
      ? product.images.map(sanitizeImage)
      : ['/image-2@2x.png'];
  } else {
    product.images = ['/image-2@2x.png'];
  }
  return product;
};

// ─── Active Offers Pricing Engine ────────────────────────────────────────────

export interface ActiveOffer {
  id: string;
  title: string;
  discount_percentage: number;
  applicable_categories: string[];
  expiry_date: string | null;
}

let cachedOffersMap: Record<string, ActiveOffer> | null = null;
let lastOffersFetchedTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache to optimize performance

export const getActiveOffersMap = async (): Promise<Record<string, ActiveOffer>> => {
  const now = Date.now();
  if (cachedOffersMap && (now - lastOffersFetchedTime < CACHE_TTL)) {
    return cachedOffersMap;
  }

  try {
    const nowStr = new Date().toISOString();
    const { data: offers, error } = await supabase
      .from('offers')
      .select('*, offer_products(product_id)')
      .eq('is_active', true)
      .or(`expiry_date.is.null,expiry_date.gte.${nowStr}`);

    if (error || !offers) return cachedOffersMap || {};

    const productOfferMap: Record<string, ActiveOffer> = {};

    for (const offer of offers) {
      const productIds = offer.offer_products?.map((op: any) => op.product_id) || [];
      for (const pid of productIds) {
        const existing = productOfferMap[pid];
        if (!existing || offer.discount_percentage > existing.discount_percentage) {
          productOfferMap[pid] = offer as any;
        }
      }
    }

    cachedOffersMap = productOfferMap;
    lastOffersFetchedTime = now;
    return productOfferMap;
  } catch (err) {
    console.error('Error fetching active offers:', err);
    return cachedOffersMap || {};
  }
};

export const applyOffersToProduct = (product: any, offersMap: Record<string, ActiveOffer>): any => {
  if (!product) return null;
  const mrp = Number(product.mrp || product.price || 0);
  let bestOffer: ActiveOffer | null = null;

  // 1. Direct offer_products link
  if (offersMap[product.id]) {
    bestOffer = offersMap[product.id];
  }

  // 2. Category link
  const allOffers = Object.values(offersMap);
  for (const offer of allOffers) {
    if (offer.applicable_categories && offer.applicable_categories.includes(product.category)) {
      if (!bestOffer || offer.discount_percentage > bestOffer.discount_percentage) {
        bestOffer = offer;
      }
    }
  }

  if (bestOffer) {
    const discount = (mrp * bestOffer.discount_percentage) / 100;
    const discountedPrice = Math.round(mrp - discount);
    return {
      ...product,
      price: discountedPrice,
      mrp: mrp,
      discount_percent: bestOffer.discount_percentage,
      offer_title: bestOffer.title,
      has_offer: true,
    };
  }

  return {
    ...product,
    price: Number(product.price),
    mrp: Number(product.mrp || product.price),
    has_offer: false,
  };
};

export const getOrder = async (orderId: string) => {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error) throw new Error(error.message);
  return data;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = async (params?: Record<string, string>) => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (params?.category) query = query.eq('category', params.category);
  if (params?.categories) query = query.in('category', params.categories.split(','));
  if (params?.isSale === 'true') query = query.eq('is_sale', true);
  if (params?.isCombo === 'true') {
    query = query.in('category', ['Combos', 'Gift Packs', '2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack']);
  }
  if (params?.search) query = query.ilike('name', `%${params.search}%`);
  if (params?.inStock === 'true') query = query.gt('stock', 0);

  // Sorting
  const sort = params?.sort || 'createdAt';
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    'best-selling': { column: 'stock', ascending: false },
    'price-asc': { column: 'price', ascending: true },
    'price-desc': { column: 'price', ascending: false },
    newest: { column: 'created_at', ascending: false },
    createdAt: { column: 'created_at', ascending: false },
  };
  const sortConfig = sortMap[sort] || sortMap.createdAt;
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  // Pagination
  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 12);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const offersMap = await getActiveOffersMap();
  const processedData = (data || []).map(sanitizeProduct).map(p => applyOffersToProduct(p, offersMap));

  // Get total count for pagination
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (params?.category) countQuery = countQuery.eq('category', params.category);
  if (params?.isSale === 'true') countQuery = countQuery.eq('is_sale', true);
  if (params?.isCombo === 'true') {
    countQuery = countQuery.in('category', ['Combos', 'Gift Packs', '2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack']);
  }
  if (params?.search) countQuery = countQuery.ilike('name', `%${params.search}%`);
  if (params?.inStock === 'true') countQuery = countQuery.gt('stock', 0);

  const { count: total } = await countQuery;

  return {
    success: true,
    data: processedData,
    pagination: {
      total: total || 0,
      page,
      pages: Math.ceil((total || 0) / limit),
    },
  };
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw new Error(error.message);

  // Increment views
  if (data?.id) {
    supabase.rpc('increment_product_views', { product_id: data.id }).then(() => {});
  }

  const offersMap = await getActiveOffersMap();
  const processedProduct = data ? applyOffersToProduct(sanitizeProduct(data), offersMap) : null;

  return { success: true, data: processedProduct };
};

// ─── Homepage Dynamic Content ────────────────────────────────────────────────

export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('key, value');
  if (error) throw new Error(error.message);
  // Transform to a simple object for easier use: { key: value }
  return (data || []).reduce((acc: Record<string, string>, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

export const getSiteContent = async (key: string) => {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', key).single();
  if (error || !data) return null;
  try {
    return JSON.parse(data.value);
  } catch (e) {
    return data.value;
  }
};

export const getHeroSlides = async () => {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'hero_slides_json').single();
  if (error || !data) return [];
  try {
    const slides = JSON.parse(data.value);
    return slides.filter((s: any) => s.is_active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).slice(0, 5);
  } catch (e) { return []; }
};

export const getHomepageProductTabs = async (): Promise<{ title: string; product_ids: string[] }[]> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'product_tabs_json')
    .single();
  if (error || !data) return [];
  try {
    return JSON.parse(data.value);
  } catch { return []; }
};

export const getTrustMetrics = async () => {
  const { data, error } = await supabase
    .from('trust_metrics')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getBenefits = async () => {
  const { data, error } = await supabase
    .from('benefits')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getAvailabilityLogos = async () => {
  const { data, error } = await supabase
    .from('availability_logos')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

  export const getTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*, products(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
  
    if (error) throw new Error(error.message);
    return (data || []).map(t => ({
      ...t,
      product: t.products ? sanitizeProduct(t.products) : null
    }));
  };

  export const getProductReviews = async (productId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('getProductReviews error:', error);
      return [];
    }
    return data || [];
  };

  export const getSeedReviewsByProductId = async (productId: string) => {
    const { data, error } = await supabase
      .from('seed_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });
  
    if (error) {
      console.error('getSeedReviewsByProductId error:', error);
      return [];
    }
    return data || [];
  };

  export const submitProductReview = async (review: {
    product_id: string;
    reviewer_name: string;
    reviewer_email: string;
    review_title: string;
    review_text: string;
    rating: number;
    review_image_url?: string;
  }) => {
    const { error } = await supabase.from('reviews').insert(review);
    if (error) throw new Error(error.message);
    return { success: true };
  };

  export { uploadReviewImage } from './s3';

  export const getRelatedProductsSection = async () => {
    const { data, error } = await supabase
      .from('related_products_section')
      .select('*, products(*)')
      .order('position', { ascending: true });
    
    if (error) {
      console.error('getRelatedProductsSection error:', error);
      return [];
    }
    const offersMap = await getActiveOffersMap();
    return (data || [])
      .map(r => r.products ? sanitizeProduct(r.products) : null)
      .filter(Boolean)
      .map(p => applyOffersToProduct(p, offersMap));
  };
  
  export const submitStockNotification = async (productId: string, email: string) => {
    const { error } = await supabase.from('stock_notification_requests').insert({
      product_id: productId,
      email: email,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  };
  
  export const getPoweredByCards = async () => {
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'powered_by_json').single();
    if (error || !data) return [];
    try {
      const cards = JSON.parse(data.value);
      return cards.filter((s: any) => s.is_active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (e) { return []; }
  };

  export const getSnackBoxItems = async () => {
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'snack_box_json').maybeSingle();
    if (error || !data) return null;
    try {
      const parsed = JSON.parse(data.value);
      // Support both old array format and new object format
      if (Array.isArray(parsed)) {
        // Legacy format — convert to new shape
        return {
          section_title: 'The Essential Snack Box',
          variants: parsed.map((item: any, idx: number) => ({
            id: item.id || `snack-legacy-${idx}`,
            title: item.title || '',
            subtitle: item.description || '',
            image_url: item.image_url || '',
            price: item.price || 0,
            mrp: item.original_price || item.mrp || 0,
            description: item.description || '',
            ingredients: item.ingredients || '',
            nutrition_table: item.nutrition_table || [],
          })),
        };
      }
      return parsed;
    } catch (e) { return null; }
  };

  export const getProductById = async (id: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).eq('is_active', true).single();
    if (error) return null;
    const offersMap = await getActiveOffersMap();
    return data ? applyOffersToProduct(sanitizeProduct(data), offersMap) : null;
  };

export const getInstagramPosts = async () => {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'instagram_json').single();
  if (error || !data) return [];
  try {
    const posts = JSON.parse(data.value);
    return posts.filter((s: any) => s.is_active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) { return []; }
};

export const getFaqs = async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getProductsByCategory = async (category: string, limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const offersMap = await getActiveOffersMap();
  return (data || []).map(sanitizeProduct).map(p => applyOffersToProduct(p, offersMap));
};

export const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const offersMap = await getActiveOffersMap();
  return (data || []).map(sanitizeProduct).map(p => applyOffersToProduct(p, offersMap));
};

export const getComboProducts = async (limit = 6) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category', 'Combos')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const offersMap = await getActiveOffersMap();
  return (data || []).map(sanitizeProduct).map(p => applyOffersToProduct(p, offersMap));
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = async (body: {
  items: Array<{ product_id: string; name: string; image: string; price: number; mrp: number; quantity: number }>;
  userDetails: { name: string; phone: string; email?: string; address: string; city?: string; state?: string; pincode?: string };
  subtotal: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount: number;
  userId?: string;
  shippingCharge?: number;
  estimatedDelivery?: string;
}) => {
  const { items, userDetails, subtotal, couponCode, discountAmount, totalAmount, userId, shippingCharge, estimatedDelivery } = body;

  // Generate UUID v4 for the order to bypass needing .select() and running into RLS errors for guests
  const orderId = crypto.randomUUID();

  let finalEmail = userDetails.email || '';
  
  // If user is logged in, always use their official account email
  if (userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      finalEmail = user.email;
    }
  }

  // Create order
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      user_name: userDetails.name,
      user_phone: userDetails.phone,
      user_email: finalEmail,
      user_address: userDetails.address,
      user_city: userDetails.city || '',
      user_state: userDetails.state || '',
      user_pincode: userDetails.pincode || '',
      subtotal,
      coupon_code: couponCode || '',
      discount_amount: discountAmount || 0,
      total_amount: totalAmount,
      user_id: userId || null,
      shipping_charge: shippingCharge || 0,
      estimated_delivery: estimatedDelivery || '',
    });

  if (orderError) throw new Error(orderError.message);
  
  // Create a mock order object for the return since we didn't select it back
  const order = { id: orderId };

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    name: item.name,
    image: item.image || '',
    price: item.price,
    mrp: item.mrp,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  // Trigger order notification email asynchronously but awaited inside a try-catch 
  // so that the browser does not abort the request when navigating away,
  // while ensuring errors never block the checkout/payment process.
  console.log(`[ORDER NOTIFICATION] Invocation start for order ID: ${order.id}`);
  try {
    const { data: invokeData, error: invokeError } = await supabase.functions.invoke('send-order-notification', {
      body: { orderId: order.id }
    });
    if (invokeError) {
      console.error(`[ORDER NOTIFICATION] Invocation error for order ID: ${order.id}`, invokeError);
    } else {
      console.log(`[ORDER NOTIFICATION] Invocation success for order ID: ${order.id}`, invokeData);
    }
  } catch (err) {
    console.error(`[ORDER NOTIFICATION] Invocation error (exception) for order ID: ${order.id}`, err);
  }

  return { success: true, data: { ...order, items: orderItems } };
};

export const getOrderById = async (id: string) => {
  // Fetch order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw new Error(orderError.message);

  // Fetch items separately as a fallback to ensure they are retrieved
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  return { success: true, data: { ...order, order_items: items || [] } };
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const applyCoupon = async (code: string, orderTotal: number) => {
  const { data: coupon, error: fetchError } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (fetchError || !coupon) {
    throw new Error('Invalid coupon code');
  }

  if (!coupon.is_active) {
    throw new Error('Coupon is no longer active');
  }

  if (new Date(coupon.expiry_date) < new Date()) {
    throw new Error('Coupon has expired');
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Coupon usage limit reached');
  }

  if (orderTotal < (coupon.min_order_value || 0)) {
    throw new Error(`Minimum order value of ₹${coupon.min_order_value} required`);
  }

  // Free shipping coupons provide no monetary discount
  const isFreeShipCoupon = coupon.free_shipping === true;
  const discountType = coupon.discount_type;
  const value = Number(coupon.value);
  const minOrderValue = Number(coupon.min_order_value || 0);
  const maxDiscount = coupon.max_discount !== null ? Number(coupon.max_discount) : null;

  let discountAmount = 0;
  if (!isFreeShipCoupon) {
    if (discountType === 'percentage') {
      discountAmount = (orderTotal * value) / 100;
      if (maxDiscount !== null) {
        discountAmount = Math.min(discountAmount, maxDiscount);
      }
    } else {
      discountAmount = value;
    }
    discountAmount = Math.min(discountAmount, orderTotal);
  }

  return {
    success: true,
    data: {
      code: coupon.code,
      discountType,
      value,
      discountAmount: Math.round(discountAmount),
      finalTotal: Math.round(orderTotal - discountAmount),
      minOrderValue,
      maxDiscount,
      expiryDate: coupon.expiry_date,
      usageLimit: coupon.usage_limit,
      usedCount: coupon.used_count,
      isActive: coupon.is_active,
      freeShipping: coupon.free_shipping || false,
    }
  };
};

// ─── Payment ─────────────────────────────────────────────────────────────────

/**
 * Initiate PhonePe payment via Next.js API route.
 * Amount is read server-side from the database (anti-spoofing).
 * Accepts orderId only — no client-side amount needed.
 */
export const initiatePayment = async (body: { orderId: string; amount?: number; userPhone?: string }) => {
  const res = await fetch('/api/payments/phonepe/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: body.orderId }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Payment initiation failed');
  }
  return data;
};

/**
 * Check payment status via Next.js API route.
 * Reconciles PhonePe status with database.
 */
export const checkPaymentStatus = async (orderId: string) => {
  const res = await fetch(`/api/payments/phonepe/status?orderId=${encodeURIComponent(orderId)}`);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to check payment status');
  }
  return data;
};

// ─── Enquiries ───────────────────────────────────────────────────────────────

export const submitEnquiry = async (body: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  orderId?: string;
  message: string;
}) => {
  const { data, error } = await supabase.from('enquiries').insert({
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    phone: body.phone,
    subject: body.subject,
    order_id: body.orderId || '',
    message: body.message,
  });

  if (error) throw new Error(error.message);
  return { success: true, data };
};

// ─── Shipment Tracking (Customer-facing) ─────────────────────────────────────

/**
 * Get live tracking info for an order shipment (customer-side).
 * Uses the shiprocket-orders edge function server-side.
 */
export const trackOrderShipment = async (params: { awbCode?: string; shipmentId?: string }) => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'track', ...params },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all orders for a given email address (for customer account page).
 */
export const getUserOrders = async (email: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// ─── Shipping Rates ──────────────────────────────────────────────────────────

/**
 * Get shipping rates from Shiprocket via edge function.
 * Uses the check-serviceability action.
 */
export const getShippingRates = async (params: {
  delivery_pincode: string;
  weight: number;
  subtotal: number;
  has_combo: boolean;
  length?: number;
  breadth?: number;
  height?: number;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
      body: { action: 'check-serviceability', ...params },
    });

    if (error) {
      console.error('getShippingRates invocation error:', error);
      // Return a fallback so checkout doesn't break
      return { 
        success: true, 
        serviceable: true, 
        shipping_charge: params.has_combo ? 99 : 50, 
        estimated_delivery: '', 
        courier_name: '', 
        free_shipping: false, 
        fallback: true,
        error: error.message
      };
    }
    
    if (!data || data.error) {
       console.warn('getShippingRates API error:', data?.error || 'Empty response');
       return { 
        success: true, 
        serviceable: true, 
        shipping_charge: params.has_combo ? 99 : 50, 
        estimated_delivery: '', 
        courier_name: '', 
        free_shipping: false, 
        fallback: true,
        error: data?.error
      };
    }

    return data;
  } catch (err: any) {
    console.error('getShippingRates network error:', err);
    return { 
      success: true, 
      serviceable: true, 
      shipping_charge: params.has_combo ? 99 : 50, 
      estimated_delivery: '', 
      courier_name: '', 
      free_shipping: false, 
      fallback: true,
      error: err.message
    };
  }
};

// ─── Saved Addresses ─────────────────────────────────────────────────────────

export interface SavedAddress {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getSavedAddresses = async (userId: string): Promise<SavedAddress[]> => {
  const { data, error } = await supabase
    .from('saved_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) { console.error('getSavedAddresses error:', error); return []; }
  return data || [];
};

export const addSavedAddress = async (address: Omit<SavedAddress, 'id' | 'created_at' | 'updated_at'>): Promise<SavedAddress | null> => {
  // If setting as default, unset all other defaults first
  if (address.is_default) {
    await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', address.user_id);
  }
  const { data, error } = await supabase.from('saved_addresses').insert(address).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateSavedAddress = async (id: string, userId: string, updates: Partial<SavedAddress>): Promise<void> => {
  // If setting as default, unset all other defaults first
  if (updates.is_default) {
    await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', userId);
  }
  const { error } = await supabase.from('saved_addresses').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteSavedAddress = async (id: string): Promise<void> => {
  const { error } = await supabase.from('saved_addresses').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
  // Unset all defaults for this user
  await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', userId);
  // Set the chosen one
  const { error } = await supabase.from('saved_addresses').update({ is_default: true }).eq('id', addressId);
  if (error) throw new Error(error.message);
};

/**
 * Check if an address already exists for this user (duplicate check).
 */
export const addressExists = async (userId: string, addressLine1: string, pincode: string, phone: string): Promise<boolean> => {
  const { data } = await supabase
    .from('saved_addresses')
    .select('id')
    .eq('user_id', userId)
    .eq('address_line_1', addressLine1)
    .eq('pincode', pincode)
    .eq('phone', phone)
    .limit(1);
  return (data && data.length > 0) || false;
};

/**
 * Get a product's slug by its ID (for Write Review navigation).
 */
export const getProductSlugById = async (productId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('id', productId)
    .single();
  if (error || !data) return null;
  return data.slug;
};

// ─── Blogs ───────────────────────────────────────────────────────────────────

export const getPublicBlogs = async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const getBlogBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const getActiveCoupons = async (): Promise<any[]> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .eq('is_visible', true)
    .gt('expiry_date', now)
    .order('min_order_value', { ascending: true });

  if (error) {
    console.error('getActiveCoupons error:', error);
    return [];
  }
  return data || [];
};

