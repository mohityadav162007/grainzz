import { supabase } from './supabase';

const sanitizeImage = (url: string) => url.includes('placeholder.jpg') ? '/image-2@2x.png' : url;
const sanitizeProduct = (product: any) => {
  if (product && Array.isArray(product.images)) {
    product.images = product.images.map(sanitizeImage);
  }
  return product;
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
    .select('*, offers(*)')
    .eq('is_active', true);

  if (params?.category) query = query.eq('category', params.category);
  if (params?.isSale === 'true') query = query.eq('is_sale', true);
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

  // Get total count for pagination
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (params?.category) countQuery = countQuery.eq('category', params.category);
  if (params?.isSale === 'true') countQuery = countQuery.eq('is_sale', true);
  if (params?.search) countQuery = countQuery.ilike('name', `%${params.search}%`);
  if (params?.inStock === 'true') countQuery = countQuery.gt('stock', 0);

  const { count: total } = await countQuery;

  return {
    success: true,
    data: (data || []).map(sanitizeProduct),
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
    .select('*, offers(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw new Error(error.message);

  // Increment views
  if (data?.id) {
    supabase.rpc('increment_product_views', { product_id: data.id }).then(() => {});
  }

  return { success: true, data: data ? sanitizeProduct(data) : null };
};

// ─── Homepage Dynamic Content ────────────────────────────────────────────────

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
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  
    if (error) throw new Error(error.message);
    return data || [];
  };
  
  export const getPoweredByCards = async () => {
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'powered_by_json').single();
    if (error || !data) return [];
    try {
      const cards = JSON.parse(data.value);
      return cards.filter((s: any) => s.is_active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (e) { return []; }
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
  return (data || []).map(sanitizeProduct);
};

export const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map(sanitizeProduct);
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
  return (data || []).map(sanitizeProduct);
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const createOrder = async (body: {
  items: Array<{ product_id: string; name: string; image: string; price: number; mrp: number; quantity: number }>;
  userDetails: { name: string; phone: string; email?: string; address: string; city?: string; state?: string; pincode?: string };
  subtotal: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount: number;
}) => {
  const { items, userDetails, subtotal, couponCode, discountAmount, totalAmount } = body;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_name: userDetails.name,
      user_phone: userDetails.phone,
      user_email: userDetails.email || '',
      user_address: userDetails.address,
      user_city: userDetails.city || '',
      user_state: userDetails.state || '',
      user_pincode: userDetails.pincode || '',
      subtotal,
      coupon_code: couponCode || '',
      discount_amount: discountAmount || 0,
      total_amount: totalAmount,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

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

  return { success: true, data: { ...order, items: orderItems } };
};

export const getOrderById = async (id: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const applyCoupon = async (code: string, orderTotal: number) => {
  const { data, error } = await supabase.rpc('apply_coupon', {
    coupon_code: code,
    order_total: orderTotal,
  });

  if (error) throw new Error(error.message);
  return data;
};

// ─── Payment ─────────────────────────────────────────────────────────────────

export const initiatePayment = async (body: { orderId: string; amount: number; userPhone: string }) => {
  const { data, error } = await supabase.functions.invoke('phonepe-payment', {
    body: { action: 'initiate', ...body },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const checkPaymentStatus = async (orderId: string) => {
  const { data, error } = await supabase.functions.invoke('phonepe-payment', {
    body: { action: 'status', orderId },
  });
  if (error) throw new Error(error.message);
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
