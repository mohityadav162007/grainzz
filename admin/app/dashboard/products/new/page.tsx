'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/api';
import { Loader2, ArrowLeft, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: 'Puffed Rice',
    stock: '',
    isSale: false,
    tags: '',
    nutritionInfo: '',
    ingredients: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      images.forEach(image => {
        formData.append('images', image);
      });

      await createProduct(formData);
      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/products" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input" placeholder="e.g., Oats Chips - Peri Peri" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="admin-input resize-none" placeholder="Product description..." />
                </div>
              </div>
            </div>

            <div className="admin-card p-6">
              <h2 className="text-lg font-bold mb-4">Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <ImagePlus size={24} className="mb-2" />
                  <span className="text-xs font-semibold">Add Image</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="admin-card p-6">
              <h2 className="text-lg font-bold mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nutrition Info</label>
                  <input value={form.nutritionInfo} onChange={e => setForm({...form, nutritionInfo: e.target.value})} className="admin-input" placeholder="e.g., High-Fibre | No Palm Oil" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ingredients</label>
                  <textarea rows={2} value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} className="admin-input resize-none" placeholder="List of ingredients..." />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="admin-card p-6">
              <h2 className="text-lg font-bold mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
                  <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="admin-input" placeholder="149" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">MRP (₹) *</label>
                  <input type="number" required value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} className="admin-input" placeholder="199" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock *</label>
                  <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="admin-input" placeholder="100" />
                </div>
              </div>
            </div>

            <div className="admin-card p-6">
              <h2 className="text-lg font-bold mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="admin-input">
                    <option value="Puffed Rice">Puffed Rice</option>
                    <option value="Healthy Chips">Healthy Chips</option>
                    <option value="Grain Puffs">Grain Puffs</option>
                    <option value="Combos">Combos</option>
                    <option value="Gift Packs">Gift Packs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="admin-input" placeholder="Jar, 150g, Bestseller" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={form.isSale} onChange={e => setForm({...form, isSale: e.target.checked})} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-700">Show in Sale section</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/products" className="admin-btn-outline">Cancel</Link>
          <button type="submit" disabled={loading} className="admin-btn px-8">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
