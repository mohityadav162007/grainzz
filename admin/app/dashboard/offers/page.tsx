'use client';
import { useState, useEffect } from 'react';
import { getOffers, createOffer, deleteOffer, getProducts } from '@/lib/api';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offersRes, productsRes] = await Promise.all([getOffers(), getProducts()]);
      setOffers(offersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const categories = (form.get('categories') as string)?.split(',').map(c => c.trim()).filter(Boolean) || [];
    try {
      await createOffer({
        title: form.get('title') as string,
        discountPercentage: Number(form.get('discountPercentage')),
        applicableProducts: selectedProducts,
        applicableCategories: categories,
        expiryDate: form.get('expiryDate') as string || undefined,
      });
      setShowForm(false);
      setSelectedProducts([]);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete offer "${title}"?`)) return;
    try {
      await deleteOffer(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Offers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product offers & discounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn">
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Offer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">Create Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input name="title" required className="admin-input" placeholder="Summer Sale 20% Off" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Discount % *</label>
              <input name="discountPercentage" type="number" required className="admin-input" placeholder="20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categories (comma separated)</label>
              <input name="categories" className="admin-input" placeholder="Healthy Chips, Grain Puffs" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
              <input name="expiryDate" type="date" className="admin-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Apply to Products</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
              {products.map((p) => (
                <button key={p.id} type="button" onClick={() => toggleProduct(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedProducts.includes(p.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Offer'}
          </button>
        </form>
      )}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Categories</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading offers...</td></tr>
              ) : offers.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No offers yet.</td></tr>
              ) : (
                offers.map((offer) => {
                  const isExpired = offer.expiry_date && new Date(offer.expiry_date) < new Date();
                  return (
                    <tr key={offer.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold">{offer.title}</td>
                      <td className="px-6 py-4 font-bold text-primary">{offer.discount_percentage}%</td>
                      <td className="px-6 py-4 text-gray-500">{offer.applicable_categories?.join(', ') || '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{offer.offer_products?.length || 0} products</td>
                      <td className="px-6 py-4 text-gray-500">{offer.expiry_date ? new Date(offer.expiry_date).toLocaleDateString('en-IN') : 'No expiry'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700' : offer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isExpired ? 'Expired' : offer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(offer.id, offer.title)} className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
