'use client';
import { useState, useEffect } from 'react';
import { getRelatedProductsSectionAdmin, updateRelatedProductsSection, getProducts } from '@/lib/api';
import { Plus, Trash2, GripVertical, Save, Loader2, Search } from 'lucide-react';
import Image from 'next/image';

export default function RelatedProductsPage() {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [relatedRes, productsRes] = await Promise.all([
        getRelatedProductsSectionAdmin(),
        getProducts({ limit: '100' }) // fetch enough products to select from
      ]);
      setSelectedProducts(relatedRes.data);
      setAllProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRelatedProductsSection(selectedProducts);
      alert('Related products updated successfully');
    } catch (err) {
      alert('Failed to update related products');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const addProduct = (product: any) => {
    if (selectedProducts.some(p => p.product_id === product.id)) return;
    setSelectedProducts(prev => [
      ...prev,
      {
        id: crypto.randomUUID(), // Temp ID
        product_id: product.id,
        products: { name: product.name, images: product.images }
      }
    ]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newProducts = [...selectedProducts];
    [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
    setSelectedProducts(newProducts);
  };

  const moveDown = (index: number) => {
    if (index === selectedProducts.length - 1) return;
    const newProducts = [...selectedProducts];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    setSelectedProducts(newProducts);
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    !selectedProducts.some(sp => sp.product_id === p.id)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">You May Also Like</h1>
          <p className="text-gray-500 text-sm mt-1">Configure the related products shown on all product pages.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="admin-btn"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected Products List */}
        <div className="admin-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Selected Products ({selectedProducts.length})</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
            ) : selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                No products selected. Add products from the right panel.
              </p>
            ) : (
              selectedProducts.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-30">▲</button>
                      <button onClick={() => moveDown(index)} disabled={index === selectedProducts.length - 1} className="p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-30">▼</button>
                    </div>
                    {item.products?.images?.[0] ? (
                      <div className="w-12 h-12 relative rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image src={item.products.images[0]} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{item.products?.name || 'Unknown Product'}</h4>
                      <p className="text-xs text-gray-500">Position: {index + 1}</p>
                    </div>
                  </div>
                  <button onClick={() => removeProduct(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Products Panel */}
        <div className="admin-card p-6">
          <h2 className="font-bold text-lg mb-4">Add Products</h2>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-9"
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No available products found.</p>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <div className="w-10 h-10 relative rounded border border-gray-200 overflow-hidden">
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                  <button onClick={() => addProduct(product)} className="p-1.5 bg-white border border-gray-200 rounded shadow-sm text-primary hover:bg-primary hover:text-white transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
