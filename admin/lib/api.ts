import { supabase } from './supabase';
import { uploadProductImageCloudinary, uploadHeroImageCloudinary, uploadInstagramImageCloudinary, uploadToCloudinary } from './cloudinary';
import { submitToIndexNow } from './indexnow';
import { revalidateClientPaths } from './revalidate';

// --- Auth ---

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

// --- Product Reference Validation Utility ---

/**
 * Scans all JSON stores for orphan product references and removes them.
 * Call on admin load or on-demand. Returns a cleanup log.
 */
export const validateProductReferences = async (): Promise<{ cleaned: string[]; total: number }> => {
  const cleaned: string[] = [];

  // Get all valid product IDs
  const { data: allProducts } = await supabase.from('products').select('id');
  const validIds = new Set((allProducts || []).map((p: any) => p.id));

  // 1. product_tabs_json
  const { data: tabsRow } = await supabase
    .from('store_settings').select('value').eq('key', 'product_tabs_json').single();
  if (tabsRow?.value) {
    try {
      const tabs = JSON.parse(tabsRow.value);
      if (Array.isArray(tabs)) {
        let changed = false;
        const cleanedTabs = tabs.map((tab: any) => {
          const orig = tab.product_ids || [];
          const valid = orig.filter((id: string) => validIds.has(id));
          if (valid.length < orig.length) {
            changed = true;
            cleaned.push(`product_tabs "${tab.title}": removed ${orig.length - valid.length} orphan(s)`);
          }
          return { ...tab, product_ids: valid };
        });
        if (changed) {
          await supabase.from('store_settings').update({ value: JSON.stringify(cleanedTabs) }).eq('key', 'product_tabs_json');
        }
      }
    } catch { /* skip */ }
  }

  // 2. team_favourites
  const { data: tfRow } = await supabase
    .from('store_settings').select('value').eq('key', 'team_favourites').single();
  if (tfRow?.value) {
    try {
      const tf = JSON.parse(tfRow.value);
      if (tf && Array.isArray(tf.product_ids)) {
        const orig = tf.product_ids;
        const valid = orig.filter((id: string) => validIds.has(id));
        if (valid.length < orig.length) {
          tf.product_ids = valid;
          cleaned.push(`team_favourites: removed ${orig.length - valid.length} orphan(s)`);
          await supabase.from('store_settings').update({ value: JSON.stringify(tf) }).eq('key', 'team_favourites');
        }
      }
    } catch { /* skip */ }
  }

  // 3. powered_by_json
  const { data: pbRow } = await supabase
    .from('store_settings').select('value').eq('key', 'powered_by_json').single();
  if (pbRow?.value) {
    try {
      const cards = JSON.parse(pbRow.value);
      if (Array.isArray(cards)) {
        let changed = false;
        const cleanedCards = cards.map((card: any) => {
          if (card.product_id && !validIds.has(card.product_id)) {
            changed = true;
            cleaned.push(`powered_by slot "${card.title || 'untitled'}": orphan removed`);
            return { ...card, product_id: null, title: '', link: '#' };
          }
          return card;
        });
        if (changed) {
          await supabase.from('store_settings').update({ value: JSON.stringify(cleanedCards) }).eq('key', 'powered_by_json');
        }
      }
    } catch { /* skip */ }
  }

  // 4. homepage_sections UUID[] arrays
  const { data: hpSections } = await supabase.from('homepage_sections').select('id, section_type, product_ids');
  if (hpSections) {
    for (const section of hpSections) {
      if (Array.isArray(section.product_ids)) {
        const valid = section.product_ids.filter((id: string) => validIds.has(id));
        if (valid.length < section.product_ids.length) {
          cleaned.push(`homepage_section "${section.section_type}": removed ${section.product_ids.length - valid.length} orphan(s)`);
          await supabase.from('homepage_sections').update({ product_ids: valid }).eq('id', section.id);
        }
      }
    }
  }

  return { cleaned, total: cleaned.length };
};

// â”€â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const isActive = formData.get('isActive') === 'true';
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];
  const nutritionTableStr = formData.get('nutritionTable') as string;
  const nutritionTable = nutritionTableStr ? JSON.parse(nutritionTableStr) : [];
  const comboNutritionStr = formData.get('comboNutrition') as string;
  const comboNutrition = comboNutritionStr ? JSON.parse(comboNutritionStr) : [];
  const ingredients = (formData.get('ingredients') as string) || '';
  const weight = (formData.get('weight') as string) || '';

  // Social Proof
  const delivery_count = Number(formData.get('delivery_count')) || 0;
  const delivery_label = (formData.get('delivery_label') as string) || '';
  const seed_rating = Number(formData.get('seed_rating')) || 5.0;
  const seed_review_count = Number(formData.get('seed_review_count')) || 0;
  const seedReviewsStr = formData.get('seedReviews') as string;
  const seedReviews = seedReviewsStr ? JSON.parse(seedReviewsStr) : [];

  // Package dimensions for Shiprocket
  const package_length = Number(formData.get('package_length')) || 15;
  const package_breadth = Number(formData.get('package_breadth')) || 15;
  const package_height = Number(formData.get('package_height')) || 10;
  const package_weight = Number(formData.get('package_weight')) || 0.5;

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
      combo_nutrition: comboNutrition,
      ingredients,
      subtitle: (formData.get('subtitle') as string) || '',
      package_length,
      package_breadth,
      package_height,
      package_weight,
      delivery_count,
      delivery_label,
      seed_rating,
      seed_review_count,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Persist seed reviews
  if (seedReviews && seedReviews.length > 0) {
    const reviewsWithProductId = seedReviews.map((r: any) => {
      const { id: rid, created_at, updated_at, ...rest } = r;
      return { ...rest, product_id: data.id };
    });
    await supabase.from('seed_reviews').insert(reviewsWithProductId);
  }

  if (isActive) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzz.com';
    submitToIndexNow([`${siteUrl}/products/${slug}`]);
  }
  // Trigger instant ISR revalidation on the client website
  revalidateClientPaths(['/', '/products', `/products/${slug}`]);
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
  if (isSale !== null) {
    updates.is_sale = isSale === 'true';
  } else if (formData.has('name')) {
    // If name is present, it's a product form submission. 
    // Checkboxes are missing from FormData when unchecked.
    updates.is_sale = false;
  }

  const isActive = formData.get('isActive');
  if (isActive !== null) {
    updates.is_active = isActive === 'true';
  } else if (formData.has('name')) {
    updates.is_active = false;
  }

  const tagsStr = formData.get('tags') as string;
  if (tagsStr) updates.tags = tagsStr.split(',').map((t) => t.trim());

  const nutritionInfo = formData.get('nutritionInfo');
  if (nutritionInfo !== null) updates.nutrition_info = nutritionInfo;

  const nutritionTableStr = formData.get('nutritionTable') as string;
  if (nutritionTableStr !== null) updates.nutrition_table = JSON.parse(nutritionTableStr);

  const comboNutritionStr = formData.get('comboNutrition') as string;
  if (comboNutritionStr !== null) updates.combo_nutrition = JSON.parse(comboNutritionStr);

  const ingredients = formData.get('ingredients');
  if (ingredients !== null) updates.ingredients = ingredients;

  const weight = formData.get('weight');
  if (weight !== null) updates.weight = weight;

  const subtitle = formData.get('subtitle');
  if (subtitle !== null) updates.subtitle = subtitle;

  // Package dimensions for Shiprocket
  const pkgLength = formData.get('package_length');
  if (pkgLength !== null) updates.package_length = Number(pkgLength) || 15;
  const pkgBreadth = formData.get('package_breadth');
  if (pkgBreadth !== null) updates.package_breadth = Number(pkgBreadth) || 15;
  const pkgHeight = formData.get('package_height');
  if (pkgHeight !== null) updates.package_height = Number(pkgHeight) || 10;
  const pkgWeight = formData.get('package_weight');
  if (pkgWeight !== null) updates.package_weight = Number(pkgWeight) || 0.5;

  // Social Proof
  const deliveryCount = formData.get('delivery_count');
  if (deliveryCount !== null) updates.delivery_count = Number(deliveryCount) || 0;
  const deliveryLabel = formData.get('delivery_label');
  if (deliveryLabel !== null) updates.delivery_label = deliveryLabel as string;
  const seedRating = formData.get('seed_rating');
  if (seedRating !== null) updates.seed_rating = Number(seedRating) || 5.0;
  const seedReviewCount = formData.get('seed_review_count');
  if (seedReviewCount !== null) updates.seed_review_count = Number(seedReviewCount) || 0;

  const seedReviewsStr = formData.get('seedReviews') as string;
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

  // Sync seed reviews
  if (seedReviewsStr !== null) {
    const seedReviews = JSON.parse(seedReviewsStr);
    await supabase.from('seed_reviews').delete().eq('product_id', id);
    if (seedReviews.length > 0) {
      const reviewsWithProductId = seedReviews.map((r: any) => {
        const { id: rid, created_at, updated_at, ...rest } = r;
        return { ...rest, product_id: id };
      });
      await supabase.from('seed_reviews').insert(reviewsWithProductId);
    }
  }

  if (data?.slug && data?.is_active) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzz.com';
    submitToIndexNow([`${siteUrl}/products/${data.slug}`]);
  }
  // Trigger instant ISR revalidation on the client website
  if (data?.slug) {
    revalidateClientPaths(['/', '/products', `/products/${data.slug}`]);
  }
  return { success: true, data };
};


export const deleteProduct = async (id: string) => {
  // â”€â”€ Cascade cleanup: remove product references from all JSON stores â”€â”€
  // The DB trigger (019) also does this, but we do it here too for immediate
  // UI consistency and as a safety net.

  try {
    // 1. Clean product_tabs_json
    const { data: tabsRow } = await supabase
      .from('store_settings').select('value').eq('key', 'product_tabs_json').single();
    if (tabsRow?.value) {
      try {
        const tabs = JSON.parse(tabsRow.value);
        if (Array.isArray(tabs)) {
          const cleaned = tabs.map((tab: any) => ({
            ...tab,
            product_ids: (tab.product_ids || []).filter((pid: string) => pid !== id),
          }));
          await supabase.from('store_settings').update({ value: JSON.stringify(cleaned) }).eq('key', 'product_tabs_json');
        }
      } catch { /* skip malformed JSON */ }
    }

    // 2. Clean team_favourites
    const { data: tfRow } = await supabase
      .from('store_settings').select('value').eq('key', 'team_favourites').single();
    if (tfRow?.value) {
      try {
        const tf = JSON.parse(tfRow.value);
        if (tf && Array.isArray(tf.product_ids)) {
          tf.product_ids = tf.product_ids.filter((pid: string) => pid !== id);
          await supabase.from('store_settings').update({ value: JSON.stringify(tf) }).eq('key', 'team_favourites');
        }
      } catch { /* skip */ }
    }

    // 3. Clean powered_by_json
    const { data: pbRow } = await supabase
      .from('store_settings').select('value').eq('key', 'powered_by_json').single();
    if (pbRow?.value) {
      try {
        const cards = JSON.parse(pbRow.value);
        if (Array.isArray(cards)) {
          const cleaned = cards.map((card: any) => {
            if (card.product_id === id) {
              return { ...card, product_id: null, title: '', link: '#' };
            }
            return card;
          });
          await supabase.from('store_settings').update({ value: JSON.stringify(cleaned) }).eq('key', 'powered_by_json');
        }
      } catch { /* skip */ }
    }

    // 4. Clean homepage_sections product_ids arrays (UUID[] column)
    const { data: hpSections } = await supabase.from('homepage_sections').select('id, product_ids');
    if (hpSections) {
      for (const section of hpSections) {
        if (Array.isArray(section.product_ids) && section.product_ids.includes(id)) {
          const cleaned = section.product_ids.filter((pid: string) => pid !== id);
          await supabase.from('homepage_sections').update({ product_ids: cleaned }).eq('id', section.id);
        }
      }
    }
  } catch (cleanupErr) {
    console.warn('[deleteProduct] Reference cleanup had errors (non-fatal):', cleanupErr);
  }

  // â”€â”€ Now delete the actual product â”€â”€
  const { data: productToDelete } = await supabase.from('products').select('slug').eq('id', id).single();
  
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);

  if (productToDelete?.slug) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzz.com';
    submitToIndexNow([`${siteUrl}/products/${productToDelete.slug}`]);
    revalidateClientPaths(['/', '/products', `/products/${productToDelete.slug}`]);
  } else {
    revalidateClientPaths(['/', '/products']);
  }

  return { success: true, message: 'Product deleted permanently' };

};

export const setProductVisibility = async (id: string, isActive: boolean) => {
  const { data, error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id).select('slug').single();
  if (error) throw new Error(error.message);
  // Trigger instant ISR revalidation on the client website
  if (data?.slug) {
    revalidateClientPaths(['/', '/products', `/products/${data.slug}`]);
  }
  return { success: true };
};

export const getSeedReviewsByProductId = async (productId: string) => {
  const { data, error } = await supabase
    .from('seed_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

// â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Coupons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  isVisible?: boolean;
  isFirstOrderOnly?: boolean;
  freeShipping?: boolean;
}) => {
  // Enforce mutually exclusive modes: Free Shipping coupons get safe defaults
  const isFreeShip = body.freeShipping === true;
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: body.code.toUpperCase(),
      discount_type: isFreeShip ? 'flat' : body.discountType,
      value: isFreeShip ? 0 : Number(body.value),
      min_order_value: Number(body.minOrderValue) || 0,
      max_discount: isFreeShip ? null : (body.maxDiscount ? Number(body.maxDiscount) : null),
      expiry_date: new Date(body.expiryDate).toISOString(),
      usage_limit: body.usageLimit ? Number(body.usageLimit) : null,
      is_visible: body.isVisible !== undefined ? body.isVisible : true,
      is_first_order_only: body.isFirstOrderOnly !== undefined ? body.isFirstOrderOnly : false,
      free_shipping: isFreeShip,
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
  isVisible: boolean;
  isFirstOrderOnly: boolean;
  freeShipping: boolean;
}>) => {
  const updates: Record<string, any> = {};
  // Enforce mutually exclusive modes on update
  const isFreeShip = body.freeShipping === true;
  if (body.code !== undefined) updates.code = body.code.toUpperCase();
  if (isFreeShip) {
    // Free Shipping mode: clear discount fields (discount_type cannot be null due to DB constraint)
    updates.discount_type = 'flat';
    updates.value = 0;
    updates.max_discount = null;
    updates.free_shipping = true;
  } else {
    if (body.discountType !== undefined) updates.discount_type = body.discountType;
    if (body.value !== undefined) updates.value = Number(body.value);
    if (body.maxDiscount !== undefined) updates.max_discount = body.maxDiscount ? Number(body.maxDiscount) : null;
    if (body.freeShipping !== undefined) updates.free_shipping = false;
  }
  if (body.minOrderValue !== undefined) updates.min_order_value = Number(body.minOrderValue) || 0;
  if (body.expiryDate !== undefined) updates.expiry_date = new Date(body.expiryDate).toISOString();
  if (body.usageLimit !== undefined) updates.usage_limit = body.usageLimit ? Number(body.usageLimit) : null;
  if (body.isActive !== undefined) updates.is_active = body.isActive;
  if (body.isVisible !== undefined) updates.is_visible = body.isVisible;
  if (body.isFirstOrderOnly !== undefined) updates.is_first_order_only = body.isFirstOrderOnly;

  const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const deleteCoupon = async (id: string) => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Coupon deleted' };
};

// â”€â”€â”€ Offers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Homepage Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Site Content (Key-Value Store) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Hero Slides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Powered By Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Snack Box Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getSnackBoxItems = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').eq('key', 'snack_box_json').single();
  if (error || !data) return [];
  try {
    return JSON.parse(data.value);
  } catch (e) { return []; }
};

const saveSnackBoxItems = async (items: any) => {
  const { data } = await supabase.from('store_settings').select('id').eq('key', 'snack_box_json').single();
  if (data) {
    const { error } = await supabase.from('store_settings').update({ value: JSON.stringify(items) }).eq('key', 'snack_box_json');
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('store_settings').insert({ key: 'snack_box_json', value: JSON.stringify(items), description: 'Snack Box Section JSON' });
    if (error) throw new Error(error.message);
  }
};

export const updateSnackBoxItems = async (items: any) => {
  await saveSnackBoxItems(items);
  return items;
};

export const uploadSnackBoxImage = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/snack-box');
};

// â”€â”€â”€ Trust Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Benefits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Availability Logos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Product Reviews (Admin Control) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Related Products Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Instagram Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ FAQs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Analytics & Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ KPIs â”€â”€
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);

  // â”€â”€ Revenue by Month â”€â”€
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

  // â”€â”€ Daily Orders (last 30 days) â”€â”€
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

  // â”€â”€ Order Status Distribution â”€â”€
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const orderStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // â”€â”€ Payment Status Distribution â”€â”€
  const paymentCounts: Record<string, number> = {};
  orders.forEach((o) => {
    paymentCounts[o.payment_status] = (paymentCounts[o.payment_status] || 0) + 1;
  });
  const paymentStatusDistribution = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

  // â”€â”€ Category Breakdown (by products + revenue) â”€â”€
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

  // â”€â”€ Top Products by Views â”€â”€
  const topProductsByViews = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map((p) => ({ name: p.name, views: p.views || 0, revenue: 0, sold: 0 }));

  // â”€â”€ Top Products by Revenue â”€â”€
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

  // â”€â”€ Coupon Usage â”€â”€
  const couponUsage = coupons.map((c) => ({
    code: c.code,
    used: c.used_count || 0,
    limit: c.usage_limit || 0,
    type: c.discount_type,
    value: Number(c.value),
    active: c.is_active,
  }));

  // â”€â”€ Stock Alerts â”€â”€
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

// â”€â”€â”€ Store Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getStoreSettings = async () => {
  const { data, error } = await supabase.from('store_settings').select('*').order('key', { ascending: true });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const updateStoreSetting = async (key: string, value: string) => {
  const { error } = await supabase.from('store_settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  return { success: true };
};

// â”€â”€â”€ Enquiries (Contact Form Submissions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Shiprocket Integration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Send selected orders to Shiprocket for shipment creation.
 * All API calls happen server-side via Supabase Edge Function.
 */
export const sendOrdersToShiprocket = async (orderIds: string[]) => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'create-shipment', orderIds },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Request AWB (Air Waybill) for a shipment that was created but didn't get auto-assigned.
 */
export const requestAwb = async (shipmentId: string) => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'request-awb', shipmentId },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Track a specific shipment by AWB code or shipment ID.
 */
export const trackShipment = async (params: { awbCode?: string; shipmentId?: string }) => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'track', ...params },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Bulk sync tracking statuses for all active shipments.
 */
export const syncAllTrackingStatuses = async () => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'sync-tracking' },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Cancel a Shiprocket order.
 */
export const cancelShiprocketOrder = async (shiprocketOrderIds: string[]) => {
  const { data, error } = await supabase.functions.invoke('shiprocket-orders', {
    body: { action: 'cancel', shiprocketOrderIds },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Force refresh Shiprocket auth token.
 */
export const refreshShiprocketToken = async () => {
  const { data, error } = await supabase.functions.invoke('shiprocket-auth', {
    body: { action: 'refresh-token' },
  });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Update order shipment fields directly in the database.
 */
export const updateOrderShipmentFields = async (id: string, fields: Record<string, any>) => {
  const { data, error } = await supabase.from('orders').update(fields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { success: true, data };
};

// â”€â”€â”€ Blogs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getBlogs = async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
};

export const getBlogById = async (id: string) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const createBlog = async (formData: FormData) => {
  const title = formData.get('title') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const sort_order = Number(formData.get('sort_order')) || 0;
  // Checkboxes are absent from FormData when unchecked â€” treat absence as false
  const is_active = formData.get('is_active') === 'true';

  let slug = (formData.get('slug') as string) || title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let featured_image_url = '';
  const file = formData.get('featured_image') as File;
  if (file && file.size > 0) {
    const { uploadBlogImageCloudinary } = await import('./cloudinary');
    featured_image_url = await uploadBlogImageCloudinary(file);
  }

  // SEO Fields
  const seo_title = (formData.get('seo_title') as string) || null;
  const meta_description = (formData.get('meta_description') as string) || null;
  const meta_keywords = (formData.get('meta_keywords') as string) || null;
  const canonical_url = (formData.get('canonical_url') as string) || null;
  const og_title = (formData.get('og_title') as string) || null;
  const og_description = (formData.get('og_description') as string) || null;
  const is_indexable = formData.get('is_indexable') !== 'false';

  let og_image_url = '';
  const ogImageFile = formData.get('og_image') as File;
  if (ogImageFile && ogImageFile.size > 0) {
    const { uploadBlogImageCloudinary } = await import('./cloudinary');
    og_image_url = await uploadBlogImageCloudinary(ogImageFile);
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      sort_order,
      is_active,
      seo_title,
      meta_description,
      meta_keywords,
      canonical_url,
      og_title,
      og_description,
      og_image_url,
      is_indexable
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, data };
};

export const updateBlog = async (id: string, formData: FormData) => {
  const updates: Record<string, any> = {};

  const title = formData.get('title') as string;
  if (title) updates.title = title;

  const slug = formData.get('slug') as string;
  if (slug) updates.slug = slug;

  const excerpt = formData.get('excerpt');
  if (excerpt !== null) updates.excerpt = excerpt as string;

  const content = formData.get('content');
  if (content !== null) updates.content = content as string;

  const sort_order = formData.get('sort_order');
  if (sort_order !== null) updates.sort_order = Number(sort_order);

  // Checkboxes are absent from FormData when unchecked â€” always explicitly set the boolean
  updates.is_active = formData.get('is_active') === 'true';

  const file = formData.get('featured_image') as File;
  if (file && file.size > 0) {
    const { uploadBlogImageCloudinary } = await import('./cloudinary');
    updates.featured_image_url = await uploadBlogImageCloudinary(file);
  } else {
    const existingImage = formData.get('existing_image') as string;
    if (existingImage) updates.featured_image_url = existingImage;
  }

  // SEO Fields
  const seo_title = formData.get('seo_title');
  if (seo_title !== null) updates.seo_title = seo_title as string;

  const meta_description = formData.get('meta_description');
  if (meta_description !== null) updates.meta_description = meta_description as string;

  const meta_keywords = formData.get('meta_keywords');
  if (meta_keywords !== null) updates.meta_keywords = meta_keywords as string;

  const canonical_url = formData.get('canonical_url');
  if (canonical_url !== null) updates.canonical_url = canonical_url as string;

  const og_title = formData.get('og_title');
  if (og_title !== null) updates.og_title = og_title as string;

  const og_description = formData.get('og_description');
  if (og_description !== null) updates.og_description = og_description as string;

  // Checkboxes are absent from FormData when unchecked â€” always explicitly set the boolean
  updates.is_indexable = formData.get('is_indexable') === 'true';

  const ogImageFile = formData.get('og_image') as File;
  if (ogImageFile && ogImageFile.size > 0) {
    const { uploadBlogImageCloudinary } = await import('./cloudinary');
    updates.og_image_url = await uploadBlogImageCloudinary(ogImageFile);
  } else {
    const existingOgImage = formData.get('existing_og_image') as string;
    if (existingOgImage) updates.og_image_url = existingOgImage;
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  // Trigger instant ISR revalidation on the client website
  if (data?.slug) {
    revalidateClientPaths(['/', '/blogs', `/blogs/${data.slug}`, `/blogs/blog/${data.slug}`]);
  }
  return { success: true, data };
};

export const deleteBlog = async (id: string) => {
  // Fetch slug before deletion so we can revalidate
  const { data: blogToDelete } = await supabase.from('blogs').select('slug').eq('id', id).single();
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (blogToDelete?.slug) {
    revalidateClientPaths(['/', '/blogs', `/blogs/${blogToDelete.slug}`, `/blogs/blog/${blogToDelete.slug}`]);
  }
  return { success: true, message: 'Blog deleted' };
};

export const setBlogVisibility = async (id: string, is_active: boolean) => {
  const { data, error } = await supabase.from('blogs').update({ is_active }).eq('id', id).select('slug').single();
  if (error) throw new Error(error.message);
  // Trigger instant ISR revalidation on the client website
  if (data?.slug) {
    revalidateClientPaths(['/', '/blogs', `/blogs/${data.slug}`, `/blogs/blog/${data.slug}`]);
  }
  return { success: true };
};
