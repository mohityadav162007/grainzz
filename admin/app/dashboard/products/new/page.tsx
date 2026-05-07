'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getCategories } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
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

const COMBO_CATEGORIES = ['2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nutritionTable, setNutritionTable] = useState<NutritionRow[]>([{ nutrient: '', per_100g: '', rda_percent: '' }]);

  // Combo nutrition
  const [comboNutrition, setComboNutrition] = useState<ComboNutritionGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const isCombo = COMBO_CATEGORIES.includes(selectedCategory);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

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

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
      imageFiles.forEach(file => form.append('images', file));
      form.append('nutritionTable', JSON.stringify(nutritionTable.filter(r => r.nutrient)));

      const cleanedCombo = comboNutrition
        .filter(g => g.name.trim())
        .map((g, i) => ({
          ...g,
          position: i + 1,
          rows: g.rows.filter(r => r.nutrient.trim())
        }));
      form.append('comboNutrition', JSON.stringify(cleanedCombo));

      await createProduct(form);
      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (imageFiles.length + newFiles.length > 10) {
      alert(`Maximum 10 images allowed per product. You can only add ${10 - imageFiles.length} more.`);
      e.target.value = '';
      return;
    }
    setImageFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/products" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Add Product</h1>
          <p className="text-gray-500 text-sm">Create a new product for your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="admin-card p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <input name="name" required className="admin-input" placeholder="e.g. Oats Chips – Peri Peri" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
              <input name="price" type="number" step="0.01" required className="admin-input" placeholder="149" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">MRP (₹) *</label>
              <input name="mrp" type="number" step="0.01" required className="admin-input" placeholder="199" />
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
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
              <input name="stock" type="number" className="admin-input" defaultValue={0} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Weight (e.g. 100g) *</label>
              <input name="weight" required className="admin-input" placeholder="150g" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Subtitle / Tagline</label>
              <input name="subtitle" className="admin-input" placeholder="High-Fibre | No Palm Oil | Baked Crunch" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} className="admin-input" placeholder="Product description..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input name="tags" className="admin-input" placeholder="Jar, 150g" />
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex items-center gap-3">
                <input name="isSale" type="checkbox" value="true" className="w-4 h-4 rounded border-gray-300" />
                <label className="text-sm font-semibold text-gray-700">Mark as Sale</label>
              </div>
              <div className="flex items-center gap-3">
                <input name="isActive" type="checkbox" value="true" defaultChecked={true} className="w-4 h-4 rounded border-gray-300" />
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
            <input name="ingredients" className="admin-input" placeholder="Oats, Peri Peri Seasoning, Rice Flour, Salt" />
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Product Images</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Drag & drop or click to upload images (Max 10)</p>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full max-w-xs mx-auto text-sm" />
          </div>
          {imageFiles.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {imageFiles.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="admin-btn">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Product'}
          </button>
          <Link href="/dashboard/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
