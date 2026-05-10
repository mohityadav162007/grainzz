'use client';
import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '@/lib/api';
import { Edit, Trash2, Plus, Search, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activating, setActivating] = useState(false);

  const inactiveCount = products.filter(p => !p.is_active).length;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 1000 }); // Fetch all to see inactive ones too
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAll = async () => {
    if (!confirm('Reactivate all inactive products and make them visible on the website?')) return;
    setActivating(true);
    try {
      const { error } = await supabase.from('products').update({ is_active: true }).eq('is_active', false);
      if (error) throw error;
      alert('All products reactivated!');
      await fetchProducts();
    } catch (err: any) {
      alert('Failed to reactivate: ' + err.message);
    } finally {
      setActivating(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-500 text-sm">Total: {products.length}</p>
            {inactiveCount > 0 && (
              <p className="text-amber-600 text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {inactiveCount} Inactive Products
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {inactiveCount > 0 && (
            <button 
              onClick={handleActivateAll}
              disabled={activating}
              className="admin-btn bg-amber-500 hover:bg-amber-600 border-amber-600 text-white"
            >
              {activating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Activate All
            </button>
          )}
          <Link href="/dashboard/products/new" className="admin-btn self-start sm:self-auto">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">No img</div>
                      )}
                      <span className="truncate max-w-[200px]">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">₹{product.price}</div>
                      {product.mrp > product.price && <div className="text-xs text-gray-400 line-through">₹{product.mrp}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.views || 0}</td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">Active</span>
                      ) : (
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/dashboard/products/${product.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
