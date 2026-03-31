'use client';
import { useState, useEffect } from 'react';
import { getOffers, createOffer, deleteOffer, getProducts } from '@/lib/api';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    discountPercentage: '',
    expiryDate: '',
    applicableCategories: [] as string[],
    applicableProducts: [] as string[],
  });

  const categories = ['Puffed Rice', 'Healthy Chips', 'Grain Puffs', 'Combos', 'Gift Packs'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOffers, resProducts] = await Promise.all([getOffers(), getProducts()]);
      setOffers(resOffers.data);
      setProducts(resProducts.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      await createOffer(form);
      setForm({ title: '', discountPercentage: '', expiryDate: '', applicableCategories: [], applicableProducts: [] });
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create offer');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete offer ${title}?`)) return;
    try {
      await deleteOffer(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(cat)
        ? prev.applicableCategories.filter(c => c !== cat)
        : [...prev.applicableCategories, cat]
    }));
  };

  const toggleProduct = (pid: string) => {
    setForm(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(pid)
        ? prev.applicableProducts.filter(id => id !== pid)
        : [...prev.applicableProducts, pid]
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Special Offers</h1>
        <p className="text-gray-500 text-sm mt-1">Create deals assigned to categories or products</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Create Form */}
        <div className="admin-card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star size={18} className="text-primary" /> Create Offer
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Offer Title *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="admin-input py-2" placeholder="Diwali Super Sale 25% Off" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Discount % *</label>
                <input required type="number" min="1" max="100" value={form.discountPercentage} onChange={e => setForm({...form, discountPercentage: e.target.value})} className="admin-input py-2 flex-col" placeholder="25" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="admin-input py-[7px]" />
              </div>
            </div>

            <div className="pt-2 border-t mt-4 border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Apply to Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${form.applicableCategories.includes(cat) ? 'bg-primary/10 border-primary text-primary font-bold' : 'border-gray-200 text-gray-500 hover:border-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
               <label className="block text-xs font-semibold text-gray-700 mb-2">Apply to Specific Products</label>
               <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                 {products.map(p => (
                   <label key={p._id} className="flex items-center gap-2 text-xs p-1 hover:bg-gray-50 cursor-pointer rounded">
                     <input type="checkbox" checked={form.applicableProducts.includes(p._id)} onChange={() => toggleProduct(p._id)} className="rounded text-primary focus:ring-primary w-3.5 h-3.5" />
                     <span className="truncate">{p.name} <span className="text-gray-400">({p.category})</span></span>
                   </label>
                 ))}
               </div>
               <p className="text-[10px] text-gray-400 mt-1 italic leading-tight">Leave both empty to apply to everything.</p>
            </div>

            {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            
            <button type="submit" disabled={creating} className="admin-btn w-full justify-center mt-2">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Offer</>}
            </button>
          </form>
        </div>

        {/* Offers List */}
        <div className="admin-card overflow-hidden lg:col-span-2">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h2 className="font-bold text-gray-900">Active Offers</h2>
             <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
               {offers.length} total
             </span>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                 <tr>
                   <th className="px-6 py-3">Title & Discount</th>
                   <th className="px-6 py-3">Applicability</th>
                   <th className="px-6 py-3 text-center">Status</th>
                   <th className="px-6 py-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {loading ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading offers...</td></tr>
                 ) : offers.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No offers currently running.</td></tr>
                 ) : (
                   offers.map((offer) => {
                     const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date();
                     return (
                     <tr key={offer._id} className={`hover:bg-gray-50/50 ${isExpired ? 'opacity-50' : ''}`}>
                       <td className="px-6 py-4">
                         <div className="font-bold text-gray-900 text-base mb-1">{offer.title}</div>
                         <div className="text-xs font-bold text-white bg-accent px-2 py-0.5 rounded-full inline-block">
                           {offer.discountPercentage}% OFF
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         {offer.applicableCategories?.length > 0 && (
                           <div className="mb-1">
                             <span className="text-xs text-gray-500 font-semibold mr-1">Cats:</span>
                             <span className="text-[11px] text-gray-800 bg-gray-100 px-1 py-0.5 rounded mr-1">
                               {offer.applicableCategories.join(', ')}
                             </span>
                           </div>
                         )}
                         {offer.applicableProducts?.length > 0 && (
                           <div>
                             <span className="text-xs text-gray-500 font-semibold mr-1">Prods:</span>
                             <span className="text-[11px] text-gray-600">
                               {offer.applicableProducts.length} items selected
                             </span>
                           </div>
                         )}
                         {(!offer.applicableCategories?.length && !offer.applicableProducts?.length) && (
                           <span className="text-[11px] bg-green-50 text-green-700 px-2 py-1 rounded font-semibold italic">Storewide</span>
                         )}
                       </td>
                       <td className="px-6 py-4 text-center">
                         {isExpired ? (
                           <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wider">Expired</span>
                         ) : (
                           <div className="text-xs">
                             <span className="text-green-600 font-bold tracking-wide">● ACTIVE</span>
                             {offer.expiryDate && (
                               <div className="text-gray-400 mt-1 text-[10px]">
                                 Ends: {new Date(offer.expiryDate).toLocaleDateString()}
                               </div>
                             )}
                           </div>
                         )}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDelete(offer._id, offer.title)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   )})
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
