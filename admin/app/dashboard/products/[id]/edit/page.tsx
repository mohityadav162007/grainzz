'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProduct } from '@/lib/api';
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import Link from 'next/link';

const categories = ['Puffed Rice', 'Healthy Chips', 'Grain Puffs', 'Combos', 'Gift Packs'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setExistingImages(res.data.images || []);
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const form = new FormData(e.currentTarget);
      // Add existing images
      existingImages.forEach((url) => form.append('existingImages', url));
      await updateProduct(id, form);
      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setNewPreviews(Array.from(files).map((f) => URL.createObjectURL(f)));
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading product...</div>;
  if (!product) return <div className="text-center py-12 text-red-500">Product not found</div>;

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
              <select name="category" required className="admin-input" defaultValue={product.category}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
              <input name="stock" type="number" className="admin-input" defaultValue={product.stock} />
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
            <div className="flex items-center gap-3 pt-6">
              <input name="isSale" type="checkbox" value="true" defaultChecked={product.is_sale} className="w-4 h-4 rounded border-gray-300" />
              <label className="text-sm font-semibold text-gray-700">Mark as Sale</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nutrition Info</label>
            <input name="nutritionInfo" className="admin-input" defaultValue={product.nutrition_info} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredients</label>
            <input name="ingredients" className="admin-input" defaultValue={product.ingredients} />
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Product Images</h2>

          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Images</p>
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Upload new images</p>
            <input name="images" type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full max-w-xs mx-auto text-sm" />
          </div>
          {newPreviews.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {newPreviews.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              ))}
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
