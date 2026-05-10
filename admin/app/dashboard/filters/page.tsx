'use client';
import { useState, useEffect } from 'react';
import { getProducts, updateProduct, getCategories } from '@/lib/api';
import { Plus, X, Package, Search, Filter, Loader2, Save, RefreshCw } from 'lucide-react';
import ProductPickerModal from '@/components/ProductPickerModal';
import { supabase } from '@/lib/supabase';

const TARGET_CATEGORIES = ['Puffed Rice', 'Healthy Chips', 'Grainzz Puffs', 'Gift Packs'];

export default function FilterManagementPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [repairing, setRepairing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 1000 });
      setAllProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    if (!confirm('This will reactivate all products and synchronize category names (e.g., Rice Puffs -> Grainzz Puffs). Proceed?')) return;
    setRepairing(true);
    try {
      // 1. Reactivate all products
      const { error: err1 } = await supabase.from('products').update({ is_active: true }).eq('is_active', false);
      if (err1) throw err1;

      // 2. Sync category names in products table
      const { error: err2 } = await supabase.from('products')
        .update({ category: 'Grainzz Puffs' })
        .or('category.eq.Grain Puffs,category.eq.Rice Puffs');
      if (err2) throw err2;

      // 3. Sync categories table names
      await supabase.from('categories')
        .update({ name: 'Grainzz Puffs', slug: 'grainzz-puffs' })
        .or('name.eq.Grain Puffs,name.eq.Rice Puffs');

      alert('System repaired and synchronized successfully!');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('Repair failed: ' + err.message);
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductsByCategory = (cat: string) => {
    return allProducts.filter(p => p.category === cat);
  };

  const handleAddProducts = async (category: string, selectedIds: string[]) => {
    setSaving(category);
    try {
      // Find products that are newly added to this category
      const currentIds = getProductsByCategory(category).map(p => p.id);
      const newIds = selectedIds.filter(id => !currentIds.includes(id));
      
      // Update each new product
      for (const id of newIds) {
        const product = allProducts.find(p => p.id === id);
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('category', category);
        formData.append('isActive', product.is_active ? 'true' : 'false');
        formData.append('isSale', product.is_sale ? 'true' : 'false');
        const res = await updateProduct(id, formData);
        if (!res.success) throw new Error('Update failed');
      }
      
      setPickerOpen(null);
      await fetchData();
    } catch (err) {
      alert('Failed to update products');
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveProduct = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from its category? It will be moved to "Uncategorized"`)) return;
    setSaving(id);
    try {
      const product = allProducts.find(p => p.id === id);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', 'Uncategorized');
      formData.append('isActive', product.is_active ? 'true' : 'false');
      formData.append('isSale', product.is_sale ? 'true' : 'false');
      const res = await updateProduct(id, formData);
      if (!res.success) throw new Error('Update failed');
      await fetchData();
    } catch (err) {
      alert('Failed to remove product');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Category Filter Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage products that appear in the main shop filters.</p>
        </div>
        <button 
          onClick={handleRepair}
          disabled={repairing || loading}
          className="admin-btn bg-amber-500 hover:bg-amber-600 border-amber-600 text-white flex items-center gap-2"
        >
          {repairing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          Repair & Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TARGET_CATEGORIES.map((cat) => {
          const catProducts = getProductsByCategory(cat);
          const isSaving = saving === cat;

          return (
            <div key={cat} className="admin-card flex flex-col h-full">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    {cat}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{catProducts.length} Products</p>
                </div>
                <button 
                  onClick={() => setPickerOpen(cat)}
                  disabled={!!saving}
                  className="admin-btn py-1.5 px-3 text-xs"
                >
                  <Plus size={14} /> Add Products
                </button>
              </div>

              <div className="flex-1 p-4">
                {catProducts.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <Package size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-400">No products assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {catProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl hover:border-primary/30 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">₹{p.price}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveProduct(p.id, p.name)}
                          disabled={!!saving}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pickerOpen && (
        <ProductPickerModal
          title={`Add Products to "${pickerOpen}"`}
          products={allProducts}
          selectedIds={getProductsByCategory(pickerOpen).map(p => p.id)}
          maxSelection={50}
          onClose={() => setPickerOpen(null)}
          onConfirm={(ids) => handleAddProducts(pickerOpen, ids)}
        />
      )}

      {saving && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-primary mb-3" />
            <p className="text-sm font-bold text-gray-900">Saving changes...</p>
          </div>
        </div>
      )}
    </div>
  );
}
