import { supabase } from './supabase';
import { uploadProductImageCloudinary, uploadHeroImageCloudinary, uploadInstagramImageCloudinary, uploadToCloudinary } from './cloudinary';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const adminLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Check admin role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Access denied. Admin privileges required.');
  }

  return {
    success: true,
    token: data.session?.access_token,
    user: { id: data.user.id, email: data.user.email, role: 'admin' },
  };
};

export const adminLogout = async () => {
  await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = async (params?: Record<string, string>) => {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });

  if (params?.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const createProduct = async (formData: FormData) => {
  // Extract fields from formData
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const mrp = Number(formData.get('mrp'));
  const category = formData.get('category') as string;
  const stock = Number(formData.get('stock') || 0);
  const isSale = formData.get('isSale') === 'true';
  const isActive = formData.get('isActive') !== 'false';
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];
  const nutritionTableStr = formData.get('nutritionTable') as string;
  const nutritionTable = nutritionTableStr ? JSON.parse(nutritionTableStr) : [];
  const ingredients = (formData.get('ingredients') as string) || '';
  const weight = (formData.get('weight') as string) || '';

  // Generate slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Upload images to Cloudinary
  const imageUrls: string[] = [];
  const files = formData.getAll('images') as File[];
  for (const file of files) {
    if (file && file.size > 0) {
      try {
        const url = await uploadProductImageCloudinary(file);
        imageUrls.push(url);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
    }
  }

  // Also handle existing image URLs passed as strings
  const existingImages = formData.getAll('existingImages') as string[];
  imageUrls.push(...existingImages.filter(Boolean));

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description,
      price,
      mrp,
      weight,
      images: imageUrls,
      category,
      stock,
      is_sale: isSale,
      is_active: isActive,
      tags,
      nutrition_info: formData.get('nutritionInfo') as string || '',
      nutrition_table: nutritionTable,
      ingredients,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateProduct = async (id: string, formData: FormData) => {
  const updates: Record<string, any> = {};

  const name = formData.get('name') as string;
  if (name) updates.name = name;

  const description = formData.get('description');
  if (description !== null) updates.description = description;

  const price = formData.get('price');
  if (price) updates.price = Number(price);

  const mrp = formData.get('mrp');
  if (mrp) updates.mrp = Number(mrp);

  const category = formData.get('category');
  if (category) updates.category = category;

  const stock = formData.get('stock');
  if (stock !== null) updates.stock = Number(stock);

  const isSale = formData.get('isSale');
  if (isSale !== null) updates.is_sale = isSale === 'true';

  const isActive = formData.get('isActive');
  if (isActive !== null) updates.is_active = isActive === 'true';

  const tagsStr = formData.get('tags') as string;
  if (tagsStr) updates.tags = tagsStr.split(',').map((t) => t.trim());

  const nutritionInfo = formData.get('nutritionInfo');
  if (nutritionInfo !== null) updates.nutrition_info = nutritionInfo;

  const nutritionTableStr = formData.get('nutritionTable') as string;
  if (nutritionTableStr !== null) updates.nutrition_table = JSON.parse(nutritionTableStr);

  const ingredients = formData.get('ingredients');
  if (ingredients !== null) updates.ingredients = ingredients;

  const weight = formData.get('weight');
  if (weight !== null) updates.weight = weight;

  // Upload new images to Cloudinary
  const files = formData.getAll('images') as File[];
  const newImageUrls: string[] = [];
  for (const file of files) {
    if (file && file.size > 0) {
      try {
        const url = await uploadProductImageCloudinary(file);
        newImageUrls.push(url);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
    }
  }

  // Merge with existing images
  const existingImages = formData.getAll('existingImages') as string[];
  if (newImageUrls.length > 0 || existingImages.length > 0) {
    updates.images = [...existingImages.filter(Boolean), ...newImageUrls];
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Product deleted permanently' };
};

export const setProductVisibility = async (id: string, isActive: boolean) => {
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const createCategory = async (category: any) => {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateCategory = async (id: string, category: any) => {
  const { data, error } = await supabase.from('categories').update(category).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = async (params?: Record<string, string>) => {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params?.status) query = query.eq('status', params.status);

  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 20);
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    success: true,
    data: data || [],
    pagination: { total: count || 0, page, pages: Math.ceil((count || 0) / limit) },
  };
};

export const getOrderStats = async () => {
  const { data, error } = await supabase.rpc('get_order_stats');
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateOrder = async (id: string, body: { status?: string; paymentStatus?: string; tracking_link?: string }) => {
  const updates: Record<string, any> = {};
  if (body.status) updates.status = body.status;
  if (body.paymentStatus) updates.payment_status = body.paymentStatus;
  if (body.tracking_link !== undefined) updates.tracking_link = body.tracking_link;

  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const getCoupons = async () => {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const createCoupon = async (body: {
  code: string;
  discountType: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
}) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: body.code.toUpperCase(),
      discount_type: body.discountType,
      value: Number(body.value),
      min_order_value: Number(body.minOrderValue) || 0,
      max_discount: body.maxDiscount ? Number(body.maxDiscount) : null,
      expiry_date: new Date(body.expiryDate).toISOString(),
      usage_limit: body.usageLimit ? Number(body.usageLimit) : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateCoupon = async (id: string, body: Partial<{
  code: string;
  discountType: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  isActive: boolean;
}>) => {
  const updates: Record<string, any> = {};
  if (body.code !== undefined) updates.code = body.code.toUpperCase();
  if (body.discountType !== undefined) updates.discount_type = body.discountType;
  if (body.value !== undefined) updates.value = Number(body.value);
  if (body.minOrderValue !== undefined) updates.min_order_value = Number(body.minOrderValue) || 0;
  if (body.maxDiscount !== undefined) updates.max_discount = body.maxDiscount ? Number(body.maxDiscount) : null;
  if (body.expiryDate !== undefined) updates.expiry_date = new Date(body.expiryDate).toISOString();
  if (body.usageLimit !== undefined) updates.usage_limit = body.usageLimit ? Number(body.usageLimit) : null;
  if (body.isActive !== undefined) updates.is_active = body.isActive;

  const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const deleteCoupon = async (id: string) => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Coupon deleted' };
};

// ─── Offers ──────────────────────────────────────────────────────────────────

export const getOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*, offer_products(product_id, products(name))')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const createOffer = async (body: {
  title: string;
  discountPercentage: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  expiryDate?: string;
}) => {
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .insert({
      title: body.title,
      discount_percentage: Number(body.discountPercentage),
      applicable_categories: body.applicableCategories || [],
      expiry_date: body.expiryDate ? new Date(body.expiryDate).toISOString() : null,
    })
    .select()
    .single();

  if (offerError) throw new Error(offerError.message);

  // Link products
  if (body.applicableProducts && body.applicableProducts.length > 0) {
    const junctions = body.applicableProducts.map((pid) => ({
      offer_id: offer.id,
      product_id: pid,
    }));
    await supabase.from('offer_products').insert(junctions);

    // Set offer_id on products
    await supabase
      .from('products')
      .update({ offer_id: offer.id })
      .in('id', body.applicableProducts);
  }

  // Link categories
  if (body.applicableCategories && body.applicableCategories.length > 0) {
    await supabase
      .from('products')
      .update({ offer_id: offer.id })
      .in('category', body.applicableCategories);
  }

  return { success: true, data: offer };
};

export const updateOffer = async (id: string, body: {
  title?: string;
  discountPercentage?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  expiryDate?: string;
  isActive?: boolean;
}) => {
  const updates: Record<string, any> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.discountPercentage !== undefined) updates.discount_percentage = Number(body.discountPercentage);
  if (body.applicableCategories !== undefined) updates.applicable_categories = body.applicableCategories;
  if (body.expiryDate !== undefined) updates.expiry_date = body.expiryDate ? new Date(body.expiryDate).toISOString() : null;
  if (body.isActive !== undefined) updates.is_active = body.isActive;

  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (offerError) throw new Error(offerError.message);

  if (body.applicableProducts !== undefined) {
    // Unlink old products
    await supabase.from('products').update({ offer_id: null }).eq('offer_id', id);
    await supabase.from('offer_products').delete().eq('offer_id', id);

    // Link new products
    if (body.applicableProducts.length > 0) {
      const junctions = body.applicableProducts.map((pid) => ({
        offer_id: id,
        product_id: pid,
      }));
      await supabase.from('offer_products').insert(junctions);
      await supabase
        .from('products')
        .update({ offer_id: id })
        .in('id', body.applicableProducts);
    }
  }

  if (body.applicableCategories !== undefined && body.applicableCategories.length > 0) {
    await supabase
      .from('products')
      .update({ offer_id: id })
      .in('category', body.applicableCategories);
  }

  return { success: true, data: offer };
};

export const deleteOffer = async (id: string) => {
  // Unlink products
  await supabase.from('products').update({ offer_id: null }).eq('offer_id', id);
  // Delete junction
  await supabase.from('offer_products').delete().eq('offer_id', id);
  // Delete offer
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Offer deleted' };
};

// ─── Homepage Sections ───────────────────────────────────────────────────────

export const getHomepageSections = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'product_tabs_json').single();
  if (error || !data) return { success: true, data: [] };
  try {
    return { success: true, data: JSON.parse(data.value) };
  } catch (e) { return { success: true, data: [] }; }
};

const saveHomepageSections = async (sections: any[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'product_tabs_json').single();
  if (data) {
    await supabase.from('store_settings').update({ value: JSON.stringify(sections) }).eq('key', 'product_tabs_json');
  } else {
    await supabase.from('store_settings').insert({ key: 'product_tabs_json', value: JSON.stringify(sections) });
  }
};

export const saveProductTabs = async (tabs: { title: string; product_ids: string[] }[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'product_tabs_json').single();
  const jsonValue = JSON.stringify(tabs);
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: jsonValue }).eq('key', 'product_tabs_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'product_tabs_json', value: jsonValue, description: 'Product tabs JSON' });
    if (error) throw new Error(error.message);
  }
  return { success: true };
};

// ─── Site Content (Key-Value Store) ──────────────────────────────────────────

export const getSiteContent = async (key: string) => {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('key', key)
    .single();
  if (error) return null;
  return data;
};

export const getAllSiteContent = async () => {
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) return [];
  // Filter out the JSON arrays we use for complex components
  return (data || []).filter((d: any) => !d.key.endsWith('_json'));
};

export const upsertSiteContent = async (key: string, value: any) => {
  const strValue = typeof value === 'string' ? value : JSON.stringify(value);
  const { data } = await supabase.from('store_settings').select('id').eq('key', key).single();
  
  if (data) {
    const { data: updated, error } = await supabase.from('store_settings').update({ value: strValue }).eq('key', key).select().single();
    if (error) throw new Error(error.message);
    return updated;
  } else {
    const { data: inserted, error } = await supabase.from('store_settings').insert({ key, value: strValue, description: 'Site content' }).select().single();
    if (error) throw new Error(error.message);
    return inserted;
  }
};

// ─── Hero Slides ─────────────────────────────────────────────────────────────

export const getHeroSlides = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'hero_slides_json').single();
  if (error || !data) return [];
  try {
    const slides = JSON.parse(data.value);
    return slides.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) { return []; }
};

const saveHeroSlides = async (slides: any[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'hero_slides_json').single();
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: JSON.stringify(slides) }).eq('key', 'hero_slides_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'hero_slides_json', value: JSON.stringify(slides), description: 'Hero slides JSON' });
    if (error) throw new Error(error.message);
  }
};

export const createHeroSlide = async (slide: any) => {
  const slides = await getHeroSlides();
  const newSlide = { ...slide, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  slides.push(newSlide);
  await saveHeroSlides(slides);
  return newSlide;
};

export const updateHeroSlide = async (id: string, slide: any) => {
  const slides = await getHeroSlides();
  const index = slides.findIndex((s: any) => s.id === id);
  if (index !== -1) {
    slides[index] = { ...slides[index], ...slide };
    await saveHeroSlides(slides);
    return slides[index];
  }
  throw new Error('Slide not found');
};

export const deleteHeroSlide = async (id: string) => {
  const slides = await getHeroSlides();
  const newSlides = slides.filter((s: any) => s.id !== id);
  await saveHeroSlides(newSlides);
};

export const uploadHeroImage = async (file: File): Promise<string> => {
  return uploadHeroImageCloudinary(file);
};

export const deleteHeroImage = async (_url: string) => {
  // Cloudinary deletion requires server-side signed requests.
  // Images are managed via Cloudinary dashboard if cleanup is needed.
};

// ─── Powered By Cards ────────────────────────────────────────────────────────

export const getPoweredByCards = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'powered_by_json').single();
  if (error || !data) return [];
  try {
    const cards = JSON.parse(data.value);
    return cards.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) { return []; }
};

const savePoweredByCards = async (cards: any[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'powered_by_json').single();
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: JSON.stringify(cards) }).eq('key', 'powered_by_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'powered_by_json', value: JSON.stringify(cards), description: 'Powered By Cards JSON' });
    if (error) throw new Error(error.message);
  }
};

export const createPoweredByCard = async (card: any) => {
  const cards = await getPoweredByCards();
  const newCard = { ...card, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  cards.push(newCard);
  await savePoweredByCards(cards);
  return newCard;
};

export const updatePoweredByCard = async (id: string, card: any) => {
  const cards = await getPoweredByCards();
  const index = cards.findIndex((s: any) => s.id === id);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...card };
    await savePoweredByCards(cards);
    return cards[index];
  }
  throw new Error('Card not found');
};

export const deletePoweredByCard = async (id: string) => {
  const cards = await getPoweredByCards();
  const newCards = cards.filter((s: any) => s.id !== id);
  await savePoweredByCards(newCards);
};

export const uploadPoweredByImage = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/powered-by');
};

// ─── Snack Box Items ─────────────────────────────────────────────────────────

export const getSnackBoxItems = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'snack_box_json').single();
  if (error || !data) return [];
  try {
    return JSON.parse(data.value);
  } catch (e) { return []; }
};

const saveSnackBoxItems = async (items: any[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'snack_box_json').single();
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: JSON.stringify(items) }).eq('key', 'snack_box_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'snack_box_json', value: JSON.stringify(items), description: 'Snack Box Section JSON' });
    if (error) throw new Error(error.message);
  }
};

export const updateSnackBoxItems = async (items: any[]) => {
  await saveSnackBoxItems(items);
  return items;
};

export const uploadSnackBoxImage = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/snack-box');
};

// ─── Trust Metrics ───────────────────────────────────────────────────────────

export const getTrustMetrics = async () => {
  const { data, error } = await supabase.from('trust_metrics').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const updateTrustMetric = async (id: string, metric: any) => {
  const { data, error } = await supabase.from('trust_metrics').update(metric).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// ─── Benefits ────────────────────────────────────────────────────────────────

export const getBenefits = async () => {
  const { data, error } = await supabase.from('benefits').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const updateBenefit = async (id: string, benefit: any) => {
  const { data, error } = await supabase.from('benefits').update(benefit).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// ─── Availability Logos ──────────────────────────────────────────────────────

export const getAvailabilityLogos = async () => {
  const { data, error } = await supabase.from('availability_logos').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createAvailabilityLogo = async (logo: any) => {
  const { data, error } = await supabase.from('availability_logos').insert(logo).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateAvailabilityLogo = async (id: string, logo: any) => {
  const { data, error } = await supabase.from('availability_logos').update(logo).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteAvailabilityLogo = async (id: string) => {
  const { error } = await supabase.from('availability_logos').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── Testimonials ────────────────────────────────────────────────────────────

export const getTestimonials = async () => {
  const { data, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createTestimonial = async (testimonial: any) => {
  const { data, error } = await supabase.from('testimonials').insert(testimonial).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateTestimonial = async (id: string, testimonial: any) => {
  const { data, error } = await supabase.from('testimonials').update(testimonial).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteTestimonial = async (id: string) => {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── Product Reviews (Admin Control) ──────────────────────────────────────────

export const getAllProductReviews = async (params?: Record<string, string>) => {
  let query = supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
  if (params?.product_id) query = query.eq('product_id', params.product_id);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const updateProductReviewVisibility = async (id: string, isVisible: boolean) => {
  const { data, error } = await supabase.from('reviews').update({ is_visible: isVisible }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const deleteProductReview = async (id: string) => {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── Related Products Section ───────────────────────────────────────────────

export const getRelatedProductsSectionAdmin = async () => {
  const { data, error } = await supabase.from('related_products_section').select('*, products(name, images)').order('position', { ascending: true });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const updateRelatedProductsSection = async (productsData: any[]) => {
  // Simple approach: delete all and insert new ones to maintain order
  await supabase.from('related_products_section').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  if (productsData.length > 0) {
    const { error } = await supabase.from('related_products_section').insert(
      productsData.map((p, i) => ({ product_id: p.product_id, position: i }))
    );
    if (error) throw new Error(error.message);
  }
  return { success: true };
};

// ─── Instagram Section ────────────────────────────────────────────────────────

export const getInstagramPostsAdmin = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'instagram_json').single();
  if (error || !data) return { success: true, data: [] };
  try {
    const posts = JSON.parse(data.value);
    return { success: true, data: posts.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) };
  } catch (e) { return { success: true, data: [] }; }
};

const saveInstagramPosts = async (posts: any[]) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'instagram_json').single();
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: JSON.stringify(posts) }).eq('key', 'instagram_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'instagram_json', value: JSON.stringify(posts), description: 'Instagram Posts JSON' });
    if (error) throw new Error(error.message);
  }
};

export const upsertInstagramPost = async (post: any) => {
  const res = await getInstagramPostsAdmin();
  const posts = res.data;
  const index = posts.findIndex((p: any) => p.id === post.id);
  const newPost = { ...post };
  if (!newPost.id) {
    newPost.id = crypto.randomUUID();
    newPost.created_at = new Date().toISOString();
    posts.push(newPost);
  } else if (index !== -1) {
    posts[index] = { ...posts[index], ...newPost };
  } else {
    posts.push(newPost);
  }
  await saveInstagramPosts(posts);
  return { success: true, data: newPost };
};

export const deleteInstagramPost = async (id: string) => {
  const res = await getInstagramPostsAdmin();
  const newPosts = res.data.filter((p: any) => p.id !== id);
  await saveInstagramPosts(newPosts);
  return { success: true };
};

export const uploadInstagramImage = async (file: File): Promise<string> => {
  return uploadInstagramImageCloudinary(file);
};

export const deleteInstagramImage = async (_url: string) => {
  // Cloudinary deletion requires server-side signed requests.
  // Images are managed via Cloudinary dashboard if cleanup is needed.
};

// ─── FAQs ────────────────────────────────────────────────────────────────────

export const getFaqs = async () => {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createFaq = async (faq: any) => {
  const { data, error } = await supabase.from('faqs').insert(faq).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateFaq = async (id: string, faq: any) => {
  const { data, error } = await supabase.from('faqs').update(faq).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteFaq = async (id: string) => {
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── Analytics & Export ──────────────────────────────────────────────────────

export const getUsersCount = async () => {
  const { count, error } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true });

  return { success: true, count: count || 0 };
};

export const getAnalyticsData = async () => {
  // Fetch all data in parallel
  const [ordersRes, productsRes, couponsRes, offersRes, usersRes] = await Promise.all([
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: true }),
    supabase.from('products').select('*'),
    supabase.from('coupons').select('*'),
    supabase.from('offers').select('*'),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const coupons = couponsRes.data || [];
  const offers = offersRes.data || [];
  const usersCount = usersRes.count || 0;

  // ── KPIs ──
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);

  // ── Revenue by Month ──
  const revenueByMonth: Record<string, number> = {};
  const ordersByMonth: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const month = new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(o.total_amount);
    ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
  });
  const revenueTimeline = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue),
    orders: ordersByMonth[month] || 0,
  }));

  // ── Daily Orders (last 30 days) ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyOrders: Record<string, { count: number; revenue: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyOrders[key] = { count: 0, revenue: 0 };
  }
  orders.forEach((o) => {
    const date = new Date(o.created_at);
    if (date >= thirtyDaysAgo) {
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyOrders[key]) {
        dailyOrders[key].count++;
        dailyOrders[key].revenue += Number(o.total_amount);
      }
    }
  });
  const dailyTimeline = Object.entries(dailyOrders)
    .map(([date, data]) => ({ date, ...data }))
    .reverse();

  // ── Order Status Distribution ──
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const orderStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // ── Payment Status Distribution ──
  const paymentCounts: Record<string, number> = {};
  orders.forEach((o) => {
    paymentCounts[o.payment_status] = (paymentCounts[o.payment_status] || 0) + 1;
  });
  const paymentStatusDistribution = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

  // ── Category Breakdown (by products + revenue) ──
  const categoryProducts: Record<string, number> = {};
  const categoryRevenue: Record<string, number> = {};
  products.forEach((p) => {
    categoryProducts[p.category] = (categoryProducts[p.category] || 0) + 1;
  });
  orders.forEach((o) => {
    (o.order_items || []).forEach((item: any) => {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + Number(item.price) * item.quantity;
      }
    });
  });
  const categoryBreakdown = Object.entries(categoryProducts).map(([name, count]) => ({
    name,
    products: count,
    revenue: Math.round(categoryRevenue[name] || 0),
  }));

  // ── Top Products by Views ──
  const topProductsByViews = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map((p) => ({ name: p.name, views: p.views || 0, revenue: 0, sold: 0 }));

  // ── Top Products by Revenue ──
  const productRevenue: Record<string, { revenue: number; sold: number; name: string }> = {};
  orders.forEach((o) => {
    (o.order_items || []).forEach((item: any) => {
      if (!productRevenue[item.product_id]) {
        productRevenue[item.product_id] = { revenue: 0, sold: 0, name: item.name };
      }
      productRevenue[item.product_id].revenue += Number(item.price) * item.quantity;
      productRevenue[item.product_id].sold += item.quantity;
    });
  });
  const topProductsByRevenue = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({ name: p.name, revenue: Math.round(p.revenue), sold: p.sold }));

  // ── Coupon Usage ──
  const couponUsage = coupons.map((c) => ({
    code: c.code,
    used: c.used_count || 0,
    limit: c.usage_limit || 0,
    type: c.discount_type,
    value: Number(c.value),
    active: c.is_active,
  }));

  // ── Stock Alerts ──
  const lowStockProducts = products
    .filter((p) => p.is_active && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({ name: p.name, stock: p.stock, category: p.category }));

  return {
    kpis: {
      totalOrders,
      paidOrders: paidOrders.length,
      totalRevenue: Math.round(totalRevenue),
      avgOrderValue: Math.round(avgOrderValue),
      totalProducts,
      activeProducts,
      totalViews,
      usersCount,
      totalDiscount: Math.round(totalDiscount),
      activeCoupons: coupons.filter((c) => c.is_active).length,
      activeOffers: offers.filter((o) => o.is_active).length,
    },
    revenueTimeline,
    dailyTimeline,
    orderStatusDistribution,
    paymentStatusDistribution,
    categoryBreakdown,
    topProductsByViews,
    topProductsByRevenue,
    couponUsage,
    lowStockProducts,
  };
};

export const exportData = async (table: string, format: 'csv' | 'json' = 'json') => {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw new Error(error.message);

  if (format === 'csv') {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
    return [headers, ...rows].join('\n');
  }
  return JSON.stringify(data, null, 2);
};

// ─── Store Settings ──────────────────────────────────────────────────────────

export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').order('key', { ascending: true });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const updateStoreSetting = async (key: string, value: string) => {
  const { error } = await supabase.from('store_settings').update({ value }).eq('key', key);
  if (error) throw new Error(error.message);
  return { success: true };
};

// ─── Enquiries (Contact Form Submissions) ───────────────────────────────────

export const getEnquiries = async () => {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const updateEnquiryStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const deleteEnquiry = async (id: string) => {
  const { error } = await supabase.from('enquiries').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};
