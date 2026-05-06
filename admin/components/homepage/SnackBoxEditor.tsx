'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Save, Loader2, Upload, X, Package, ImageIcon, Plus, Minus, Trash2,
  ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react';
import { updateSnackBoxItems, uploadSnackBoxImage } from '@/lib/api';

interface NutritionRow {
  nutrient: string;
  per_100g: string;
  rda_percent: string;
}

interface SnackBoxVariant {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  price: number;
  mrp: number;
  description: string;
  ingredients: string;
  nutrition_table: NutritionRow[];
}

interface SnackBoxData {
  section_title: string;
  variants: SnackBoxVariant[];
}

const DEFAULT_VARIANT: SnackBoxVariant = {
  id: '',
  title: '',
  subtitle: '',
  image_url: '',
  price: 0,
  mrp: 0,
  description: '',
  ingredients: '',
  nutrition_table: [],
};

const DEFAULT_DATA: SnackBoxData = {
  section_title: 'The Essential Snack Box',
  variants: [
    { ...DEFAULT_VARIANT, id: '1', title: 'Box of 6 Grainzz', price: 599, mrp: 799 },
    { ...DEFAULT_VARIANT, id: '2', title: 'Box of 10 Grainzz', price: 899, mrp: 1199 },
  ],
};

function migrateFromLegacy(items: any): SnackBoxData {
  if (items && items.section_title && items.variants) return items;
  if (Array.isArray(items) && items.length > 0) {
    return {
      section_title: 'The Essential Snack Box',
      variants: items.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        title: item.title || '',
        subtitle: item.subtitle || item.description || '',
        image_url: item.image_url || '',
        price: item.price || 0,
        mrp: item.original_price || item.mrp || 0,
        description: item.description || '',
        ingredients: item.ingredients || '',
        nutrition_table: item.nutrition_table || [],
      })),
    };
  }
  return DEFAULT_DATA;
}

export default function SnackBoxEditor({ items: initialItems, onRefresh }: { items: any; onRefresh: () => void }) {
  const [data, setData] = useState<SnackBoxData>(migrateFromLegacy(initialItems));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(data.variants[0]?.id || null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setData(migrateFromLegacy(initialItems));
  }, [initialItems]);

  const handleImageUpload = useCallback(async (variantId: string, file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(variantId);
    try {
      const publicUrl = await uploadSnackBoxImage(file);
      setData(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === variantId ? { ...v, image_url: publicUrl } : v),
      }));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUploading(null); }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSnackBoxItems(data);
      console.log('[DB SAVE] Snack Box data saved:', data);
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateVariantField = (variantId: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v),
    }));
  };

  const addVariant = () => {
    const newId = crypto.randomUUID();
    setData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...DEFAULT_VARIANT, id: newId, title: `Box of ${prev.variants.length + 6} Grainzz` }],
    }));
    setExpandedVariant(newId);
  };

  const removeVariant = (variantId: string) => {
    if (data.variants.length <= 1) { alert('You need at least one variant.'); return; }
    if (!confirm('Remove this variant?')) return;
    setData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId),
    }));
  };

  const addNutritionRow = (variantId: string) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId
          ? { ...v, nutrition_table: [...v.nutrition_table, { nutrient: '', per_100g: '', rda_percent: '' }] }
          : v
      ),
    }));
  };

  const updateNutritionRow = (variantId: string, rowIdx: number, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId
          ? {
              ...v,
              nutrition_table: v.nutrition_table.map((row, i) =>
                i === rowIdx ? { ...row, [field]: value } : row
              ),
            }
          : v
      ),
    }));
  };

  const removeNutritionRow = (variantId: string, rowIdx: number) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId
          ? { ...v, nutrition_table: v.nutrition_table.filter((_, i) => i !== rowIdx) }
          : v
      ),
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Essential Snack Box</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage snack box variants with full product details — Description, Nutrition, Ingredients — displayed as a mini product detail on the homepage.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All Changes
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Section Title (displayed on homepage)</label>
        <input
          type="text"
          value={data.section_title || ''}
          onChange={e => setData(prev => ({ ...prev, section_title: e.target.value }))}
          className="admin-input text-sm w-full max-w-md"
          placeholder="The Essential Snack Box"
        />
      </div>

      {/* Variants */}
      <div className="space-y-4 mb-6">
        {data.variants.map((variant, idx) => {
          const isExpanded = expandedVariant === variant.id;
          return (
            <div key={variant.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {/* Variant Header */}
              <button
                onClick={() => setExpandedVariant(isExpanded ? null : variant.id)}
                className="w-full px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    Variant {idx + 1}: {variant.title || 'Untitled'}
                  </span>
                  {variant.price > 0 && (
                    <span className="text-xs font-medium text-gray-400 ml-2">₹{variant.price}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {data.variants.length > 1 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); removeVariant(variant.id); }}
                      className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: Image */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <ImageIcon size={10} /> Product Image
                      </label>
                      {variant.image_url ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
                          <img src={variant.image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => fileRefs.current[variant.id]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white">
                              <Upload size={10} /> Replace
                            </button>
                            <button onClick={() => updateVariantField(variant.id, 'image_url', '')} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600">
                              <X size={10} /> Remove
                            </button>
                          </div>
                          {uploading === variant.id && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <Loader2 size={24} className="animate-spin text-gray-600" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileRefs.current[variant.id]?.click()}
                          className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          {uploading === variant.id ? (
                            <><Loader2 size={24} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
                          ) : (
                            <><Upload size={24} className="text-gray-300 mb-2" /><span className="text-xs font-medium text-gray-500">Click to upload image</span><span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</span></>
                          )}
                        </div>
                      )}
                      <input
                        ref={el => { fileRefs.current[variant.id] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(variant.id, f); e.target.value = ''; }}
                      />
                    </div>

                    {/* Right: Basic Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Variant Title</label>
                        <input type="text" value={variant.title || ''} onChange={e => updateVariantField(variant.id, 'title', e.target.value)}
                          className="admin-input text-sm w-full" placeholder="Box of 6 Grainzz" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Subtitle / Tagline</label>
                        <input type="text" value={variant.subtitle || ''} onChange={e => updateVariantField(variant.id, 'subtitle', e.target.value)}
                          className="admin-input text-sm w-full" placeholder="High-Fibre | No Palm Oil | Baked Crunch" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Price (₹)</label>
                          <input type="number" value={variant.price || ''} onChange={e => updateVariantField(variant.id, 'price', Number(e.target.value))}
                            className="admin-input text-sm w-full" placeholder="599" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">MRP (₹)</label>
                          <input type="number" value={variant.mrp || ''} onChange={e => updateVariantField(variant.id, 'mrp', Number(e.target.value))}
                            className="admin-input text-sm w-full" placeholder="799" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                    <textarea
                      value={variant.description || ''}
                      onChange={e => updateVariantField(variant.id, 'description', e.target.value)}
                      className="admin-input text-sm w-full"
                      rows={3}
                      placeholder="Detailed description of this snack box variant..."
                    />
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ingredients</label>
                    <textarea
                      value={variant.ingredients || ''}
                      onChange={e => updateVariantField(variant.id, 'ingredients', e.target.value)}
                      className="admin-input text-sm w-full"
                      rows={2}
                      placeholder="Oats, Quinoa, Ragi, Bajra, Salt, Spices..."
                    />
                  </div>

                  {/* Nutrition Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nutrition Breakdown</label>
                      <button
                        onClick={() => addNutritionRow(variant.id)}
                        className="admin-btn-outline text-xs py-1 px-2"
                      >
                        <Plus size={12} /> Add Row
                      </button>
                    </div>
                    {variant.nutrition_table.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_1fr_1fr_40px] bg-gray-50 border-b border-gray-200">
                          <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nutrient</div>
                          <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Per 100g</div>
                          <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">% RDA</div>
                          <div />
                        </div>
                        {/* Rows */}
                        {variant.nutrition_table.map((row, rowIdx) => (
                          <div key={rowIdx} className="grid grid-cols-[1fr_1fr_1fr_40px] border-b border-gray-100 last:border-0">
                            <input
                              value={row.nutrient}
                              onChange={e => updateNutritionRow(variant.id, rowIdx, 'nutrient', e.target.value)}
                              className="px-3 py-2 text-sm border-r border-gray-100 focus:outline-none focus:bg-blue-50"
                              placeholder="Energy"
                            />
                            <input
                              value={row.per_100g}
                              onChange={e => updateNutritionRow(variant.id, rowIdx, 'per_100g', e.target.value)}
                              className="px-3 py-2 text-sm border-r border-gray-100 focus:outline-none focus:bg-blue-50"
                              placeholder="450 kcal"
                            />
                            <input
                              value={row.rda_percent}
                              onChange={e => updateNutritionRow(variant.id, rowIdx, 'rda_percent', e.target.value)}
                              className="px-3 py-2 text-sm focus:outline-none focus:bg-blue-50"
                              placeholder="22%"
                            />
                            <button
                              onClick={() => removeNutritionRow(variant.id, rowIdx)}
                              className="flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-3">No nutrition data added yet. Click "Add Row" to start.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Variant Button */}
      <button onClick={addVariant} className="admin-btn-outline text-sm w-full justify-center py-3">
        <Plus size={14} /> Add Another Variant
      </button>
    </div>
  );
}
