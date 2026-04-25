'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/api';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

const categories = ['Puffed Rice', 'Healthy Chips', 'Grain Puffs', 'Combos', 'Gift Packs'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
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
            <div className="flex items-center gap-3 pt-6">
              <input name="isSale" type="checkbox" value="true" className="w-4 h-4 rounded border-gray-300" />
              <label className="text-sm font-semibold text-gray-700">Mark as Sale</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nutrition Info</label>
            <input name="nutritionInfo" className="admin-input" placeholder="High-Fibre | No Palm Oil | Baked Crunch" />
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
            <p className="text-sm text-gray-500 mb-2">Drag & drop or click to upload images</p>
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
