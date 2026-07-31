'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProduct, getCategories, getSeedReviewsByProductId } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, X, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import Link from 'next/link';

interface NutritionRow {
  nutrient: string;
  per_100g: string;
  rda_percent: string;
}

interface ComboNutritionGroup {
  name: string;
  position: number;
  rows: NutritionRow[];
}

interface SeedReview {
  customer_name: string;
  rating: number;
  review_title: string;
  review_message: string;
  verified_purchase: boolean;
  review_date: string;
  display_order: number;
}

const COMBO_CATEGORIES = ['2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [makePrimary, setMakePrimary] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Single-product nutrition
  const [nutritionTable, setNutritionTable] = useState<NutritionRow[]>([]);

  // Combo nutrition groups
  const [comboNutrition, setComboNutrition] = useState<ComboNutritionGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  // Seed Reviews
  const [seedReviews, setSeedReviews] = useState<SeedReview[]>([]);

  const isCombo = COMBO_CATEGORIES.includes(selectedCategory);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProductById(id),
      getCategories(),
      getSeedReviewsByProductId(id).catch(err => {
        console.error('Seed reviews fetch failed:', err);
        return { success: true, data: [] }; // Fallback to empty
      })
    ]).then(([productRes, catRes, seedRes]) => {
      const p = productRes.data;
      setProduct(p);
      setExistingImages(p.images || []);
      setCategories(catRes.data);
      setSelectedCategory(p.category || '');
      setNutritionTable(p.nutrition_table || [{ nutrient: '', per_100g: '', rda_percent: '' }]);
      setComboNutrition(p.combo_nutrition || []);
      setSeedReviews(seedRes.data || []);
    }).catch((err) => {
      console.error('Edit page fetch failed:', err);
      setError('Failed to load data');
    })
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Single Nutrition Helpers ─────────────────────────
  const addNutritionRow = () => {
    setNutritionTable([...nutritionTable, { nutrient: '', per_100g: '', rda_percent: '' }]);
  };

  const removeNutritionRow = (index: number) => {
    setNutritionTable(nutritionTable.filter((_, i) => i !== index));
  };

  const handleNutritionChange = (index: number, field: string, value: string) => {
    const newTable = [...nutritionTable];
    (newTable[index] as any)[field] = value;
    setNutritionTable(newTable);
  };

  // ─── Combo Nutrition Helpers ──────────────────────────
  const addComboGroup = () => {
    setComboNutrition(prev => [
      ...prev,
      { name: '', position: prev.length + 1, rows: [{ nutrient: '', per_100g: '', rda_percent: '' }] }
    ]);
    setExpandedGroup(comboNutrition.length);
  };

  const removeComboGroup = (index: number) => {
    setComboNutrition(prev => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, position: i + 1 })));
    if (expandedGroup === index) setExpandedGroup(null);
    else if (expandedGroup !== null && expandedGroup > index) setExpandedGroup(expandedGroup - 1);
  };

  const updateGroupName = (index: number, name: string) => {
    setComboNutrition(prev => prev.map((g, i) => i === index ? { ...g, name } : g));
  };

  const addComboRow = (groupIndex: number) => {
    setComboNutrition(prev => prev.map((g, i) =>
      i === groupIndex ? { ...g, rows: [...g.rows, { nutrient: '', per_100g: '', rda_percent: '' }] } : g
    ));
  };

  const removeComboRow = (groupIndex: number, rowIndex: number) => {
    setComboNutrition(prev => prev.map((g, i) =>
      i === groupIndex ? { ...g, rows: g.rows.filter((_, ri) => ri !== rowIndex) } : g
    ));
  };

  const handleComboRowChange = (groupIndex: number, rowIndex: number, field: string, value: string) => {
    setComboNutrition(prev => prev.map((g, gi) => {
      if (gi !== groupIndex) return g;
      const newRows = [...g.rows];
      (newRows[rowIndex] as any)[field] = value;
      return { ...g, rows: newRows };
    }));
  };

  const moveComboGroup = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= comboNutrition.length) return;
    setComboNutrition(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((g, i) => ({ ...g, position: i + 1 }));
    });
    setExpandedGroup(target);
  };

  // ─── Seed Review Helpers ─────────────────────────────
  const addSeedReview = () => {
    setSeedReviews([...seedReviews, { 
      customer_name: '', 
      rating: 5, 
      review_title: '', 
      review_message: '', 
      verified_purchase: true, 
      review_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      display_order: seedReviews.length 
    }]);
  };

  const removeSeedReview = (index: number) => {
    setSeedReviews(seedReviews.filter((_, i) => i !== index));
  };

  const handleSeedReviewChange = (index: number, field: string, value: any) => {
    const newReviews = [...seedReviews];
    (newReviews[index] as any)[field] = value;
    setSeedReviews(newReviews);
  };

  const moveSeedReview = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= seedReviews.length) return;
    const newReviews = [...seedReviews];
    [newReviews[index], newReviews[target]] = [newReviews[target], newReviews[index]];
    setSeedReviews(newReviews.map((r, i) => ({ ...r, display_order: i })));
  };

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
      existingImages.forEach((url) => form.append('existingImages', url));
      newImageFiles.forEach(file => form.append('images', file));
      form.append('primaryNew', makePrimary ? 'true' : 'false');

      // Normal nutrition
      form.append('nutritionTable', JSON.stringify(nutritionTable.filter(r => r.nutrient)));

      // Combo nutrition
      const cleanedCombo = comboNutrition
        .filter(g => g.name.trim())
        .map((g, i) => ({
          ...g,
          position: i + 1,
          rows: g.rows.filter(r => r.nutrient.trim())
        }));
      form.append('comboNutrition', JSON.stringify(cleanedCombo));

      const cleanedSeedReviews = seedReviews
        .filter(r => r.customer_name.trim() && r.review_message.trim())
        .map((r, i) => ({ ...r, display_order: i }));
      form.append('seedReviews', JSON.stringify(cleanedSeedReviews));

      await updateProduct(id, form);
      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newImages = [...existingImages];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setExistingImages(newImages);
    setDraggedIndex(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const incomingFiles = Array.from(files);
    if (existingImages.length + newImageFiles.length + incomingFiles.length > 10) {
      alert(`Maximum 10 images allowed. You can only add ${10 - existingImages.length - newImageFiles.length} more.`);
      e.target.value = '';
      return;
    }
    setNewImageFiles(prev => [...prev, ...incomingFiles]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/products" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="admin-card p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <input name="name" required className="admin-input" defaultValue={product.name} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
              <input name="price" type="number" step="0.01" required className="admin-input" defaultValue={product.price} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">MRP (₹) *</label>
              <input name="mrp" type="number" step="0.01" required className="admin-input" defaultValue={product.mrp} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                required
                className="admin-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
              <input name="stock" type="number" className="admin-input" defaultValue={product.stock} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Weight (e.g. 100g) *</label>
              <input name="weight" required className="admin-input" defaultValue={product.weight} placeholder="150g" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Subtitle / Tagline</label>
              <input name="subtitle" className="admin-input" defaultValue={product.subtitle} placeholder="High-Fibre | No Palm Oil | Baked Crunch" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} className="admin-input" defaultValue={product.description} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
              <input name="tags" className="admin-input" defaultValue={product.tags?.join(', ')} />
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex items-center gap-3">
                <input name="isSale" type="checkbox" value="true" defaultChecked={product.is_sale} className="w-4 h-4 rounded border-gray-300" />
                <label className="text-sm font-semibold text-gray-700">Mark as Sale</label>
              </div>
              <div className="flex items-center gap-3">
                <input name="isActive" type="checkbox" value="true" defaultChecked={product.is_active !== false} className="w-4 h-4 rounded border-gray-300" />
                <label className="text-sm font-semibold text-gray-700">Is Active (Visible)</label>
                <input type="hidden" name="isActive_fallback" value="false" />
              </div>
            </div>
          </div>

          {/* ─── Nutrition Section ─── */}
          {isCombo ? (
            /* ═══ COMBO NUTRITION MANAGEMENT ═══ */
            <div className="space-y-4 border-t pt-5 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-gray-900">Combo Nutrition Management</label>
                  <p className="text-xs text-gray-500 mt-0.5">Add separate nutrition tables for each product inside this combo.</p>
                </div>
                <button type="button" onClick={addComboGroup} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {comboNutrition.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  No sub-products added yet. Click "Add Product" to begin.
                </div>
              )}

              <div className="space-y-3">
                {comboNutrition.map((group, gi) => (
                  <div key={gi} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {/* Group Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveComboGroup(gi, 'up')} disabled={gi === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
                          <ChevronUp size={12} />
                        </button>
                        <button type="button" onClick={() => moveComboGroup(gi, 'down')} disabled={gi === comboNutrition.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-400 w-5">#{gi + 1}</span>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateGroupName(gi, e.target.value)}
                        placeholder="Sub-product name (e.g. Ragi Chips)"
                        className="flex-1 text-sm font-semibold bg-transparent border-none outline-none placeholder:text-gray-300 text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setExpandedGroup(expandedGroup === gi ? null : gi)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        {expandedGroup === gi ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button type="button" onClick={() => removeComboGroup(gi)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Group Body */}
                    {expandedGroup === gi && (
                      <div className="p-4 space-y-2">
                        <div className="flex gap-2 text-[11px] font-bold uppercase text-gray-400 px-1">
                          <span className="flex-1">Nutrient</span>
                          <span className="flex-1">Per 100g</span>
                          <span className="flex-1">% RDA</span>
                          <span className="w-9" />
                        </div>
                        {group.rows.map((row, ri) => (
                          <div key={ri} className="flex gap-2 items-center">
                            <input
                              placeholder="e.g. Protein"
                              value={row.nutrient}
                              onChange={e => handleComboRowChange(gi, ri, 'nutrient', e.target.value)}
                              className="admin-input text-xs flex-1"
                            />
                            <input
                              placeholder="e.g. 8.5g"
                              value={row.per_100g}
                              onChange={e => handleComboRowChange(gi, ri, 'per_100g', e.target.value)}
                              className="admin-input text-xs flex-1"
                            />
                            <input
                              placeholder="e.g. 17%"
                              value={row.rda_percent}
                              onChange={e => handleComboRowChange(gi, ri, 'rda_percent', e.target.value)}
                              className="admin-input text-xs flex-1"
                            />
                            <button type="button" onClick={() => removeComboRow(gi, ri)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addComboRow(gi)} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline mt-1">
                          <Plus size={12} /> Add Row
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ═══ SINGLE PRODUCT NUTRITION TABLE ═══ */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">Nutrition Table</label>
                <button type="button" onClick={addNutritionRow} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="space-y-2">
                {nutritionTable.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      placeholder="Nutrient"
                      value={row.nutrient}
                      onChange={e => handleNutritionChange(i, 'nutrient', e.target.value)}
                      className="admin-input text-xs"
                    />
                    <input
                      placeholder="Per 100g"
                      value={row.per_100g}
                      onChange={e => handleNutritionChange(i, 'per_100g', e.target.value)}
                      className="admin-input text-xs"
                    />
                    <input
                      placeholder="% RDA"
                      value={row.rda_percent}
                      onChange={e => handleNutritionChange(i, 'rda_percent', e.target.value)}
                      className="admin-input text-xs"
                    />
                    <button type="button" onClick={() => removeNutritionRow(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredients</label>
            <input name="ingredients" className="admin-input" defaultValue={product.ingredients} placeholder="Oats, Peri Peri Seasoning, Rice Flour, Salt" />
          </div>
        </div>

        {/* ─── Social Proof Section ─── */}
        <div className="admin-card p-6 space-y-6">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">✨ Social Proof & Ratings</h2>
            <p className="text-xs text-gray-500 mt-1">Configure seed stats and customer testimonials for immediate trust.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Count (Smiles)</label>
              <input name="delivery_count" type="number" className="admin-input" defaultValue={product.delivery_count || 0} placeholder="e.g. 146000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Label</label>
              <input name="delivery_label" type="text" className="admin-input" defaultValue={product.delivery_label || 'Meals Delivered'} placeholder="e.g. Meals Delivered" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seed Rating (0.0–5.0)</label>
              <input name="seed_rating" type="number" step="0.1" min="0" max="5" className="admin-input" defaultValue={product.seed_rating || 5.0} placeholder="5.0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seed Review Count</label>
              <input name="seed_review_count" type="number" className="admin-input" defaultValue={product.seed_review_count || 0} placeholder="654" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-900">Seed Reviews (Testimonials)</label>
                <p className="text-xs text-gray-500 mt-0.5">These appear immediately on the product page. They do NOT affect the rating calculation above.</p>
              </div>
              <button type="button" onClick={addSeedReview} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">
                <Plus size={14} /> Add Review
              </button>
            </div>

            {seedReviews.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                No seed reviews added. Click "Add Review" to add testimonials.
              </div>
            )}

            <div className="space-y-4">
              {seedReviews.map((review, ri) => (
                <div key={ri} className="border border-gray-200 rounded-xl p-4 bg-white space-y-4 shadow-sm relative group">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Review #{ri + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moveSeedReview(ri, 'up')} disabled={ri === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronUp size={14}/></button>
                        <button type="button" onClick={() => moveSeedReview(ri, 'down')} disabled={ri === seedReviews.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ChevronDown size={14}/></button>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeSeedReview(ri)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Customer Name *</label>
                      <input 
                        value={review.customer_name} 
                        onChange={e => handleSeedReviewChange(ri, 'customer_name', e.target.value)}
                        className="admin-input text-sm" 
                        placeholder="e.g. Rahul S." 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Rating (1-5) *</label>
                      <select 
                        value={review.rating} 
                        onChange={e => handleSeedReviewChange(ri, 'rating', Number(e.target.value))}
                        className="admin-input text-sm"
                      >
                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Review Title</label>
                      <input 
                        value={review.review_title} 
                        onChange={e => handleSeedReviewChange(ri, 'review_title', e.target.value)}
                        className="admin-input text-sm" 
                        placeholder="e.g. Delicious & Healthy!" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Review Date</label>
                      <input 
                        value={review.review_date} 
                        onChange={e => handleSeedReviewChange(ri, 'review_date', e.target.value)}
                        className="admin-input text-sm" 
                        placeholder="e.g. October 24, 2025" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Review Message *</label>
                      <textarea 
                        value={review.review_message} 
                        onChange={e => handleSeedReviewChange(ri, 'review_message', e.target.value)}
                        className="admin-input text-sm h-20 resize-none" 
                        placeholder="Review content..." 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Package Dimensions for Shiprocket ─── */}
        <div className="admin-card p-6 space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">📦 Shipping Package Dimensions</h2>
            <p className="text-xs text-gray-500 mt-1">Used by Shiprocket for shipping rate calculation. Leave defaults if unsure.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Length (cm)</label>
              <input name="package_length" type="number" step="0.1" min="1" className="admin-input" defaultValue={product.package_length ?? 15} placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Breadth (cm)</label>
              <input name="package_breadth" type="number" step="0.1" min="1" className="admin-input" defaultValue={product.package_breadth ?? 15} placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm)</label>
              <input name="package_height" type="number" step="0.1" min="1" className="admin-input" defaultValue={product.package_height ?? 10} placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
              <input name="package_weight" type="number" step="0.01" min="0.01" className="admin-input" defaultValue={product.package_weight ?? 0.5} placeholder="0.5" />
            </div>
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Product Images</h2>

          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Images</p>
              <div className="flex gap-4 flex-wrap">
                {existingImages.map((url, i) => (
                  <div 
                    key={i} 
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(i)}
                    className={`relative group cursor-grab active:cursor-grabbing transition-all duration-300 ${
                      draggedIndex === i ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg z-10 pointer-events-none" />
                    <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-primary transition-all shadow-sm" />
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(i)} 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-1 right-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Upload new images (Max 10 total)</p>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full max-w-xs mx-auto text-sm" />
          </div>
          {newImageFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="makePrimaryCheckbox"
                  checked={makePrimary}
                  onChange={(e) => setMakePrimary(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="makePrimaryCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Set newly uploaded image as Main (Primary) Product Image
                </label>
              </div>
              <div className="flex gap-3 flex-wrap">
                {newImageFiles.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
          <Link href="/dashboard/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
