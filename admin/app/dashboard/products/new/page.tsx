'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, getCategories } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [nutritionTable, setNutritionTable] = useState([{ nutrient: '', per_100g: '', rda_percent: '' }]);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
      // Add nutrition table as JSON string
      form.append('nutritionTable', JSON.stringify(nutritionTable.filter(r => r.nutrient)));
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
    if (files.length > 10) {
      alert('Maximum 10 images allowed per product');
      e.target.value = '';
      setPreviews([]);
      return;
    }
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
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
              <select name="category" required className="admin-input">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <input name="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full max-w-xs mx-auto text-sm" />
          </div>
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {previews.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
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
