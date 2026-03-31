'use client';
import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, deleteCoupon } from '@/lib/api';
import { Loader2, Plus, Tag, Trash2 } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    minOrderValue: '0',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      await createCoupon(form);
      setForm({ code: '', discountType: 'percentage', value: '', minOrderValue: '0', maxDiscount: '', expiryDate: '', usageLimit: '' });
      await fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Discount Coupons</h1>
        <p className="text-gray-500 text-sm mt-1">Create and manage promotional codes</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Create Coupon Form */}
        <div className="admin-card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Tag size={18} className="text-primary" /> Create New Coupon
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="admin-input uppercase font-mono" placeholder="WELCOME20" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type *</label>
                <select required value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="admin-input py-[7px]">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Value *</label>
                <input required type="number" min="1" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="admin-input py-[7px]" placeholder={form.discountType === 'percentage' ? '20' : '150'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order (₹)</label>
                <input type="number" min="0" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} className="admin-input py-[7px]" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Discount (₹)</label>
                <input type="number" min="1" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} disabled={form.discountType === 'flat'} className="admin-input py-[7px] disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="None" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date *</label>
                <input required type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="admin-input py-[7px]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Usage Limit</label>
                <input type="number" min="1" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} className="admin-input py-[7px]" placeholder="Unlimited" />
              </div>
            </div>

            {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            
            <button type="submit" disabled={creating} className="admin-btn w-full justify-center mt-2">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Coupon</>}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="admin-card overflow-hidden lg:col-span-2">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h2 className="font-bold text-gray-900">Active Coupons</h2>
             <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
               {coupons.length} total
             </span>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                 <tr>
                   <th className="px-6 py-3">Code</th>
                   <th className="px-6 py-3">Discount</th>
                   <th className="px-6 py-3">Conditions</th>
                   <th className="px-6 py-3 text-center">Status</th>
                   <th className="px-6 py-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {loading ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading coupons...</td></tr>
                 ) : coupons.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No coupons active.</td></tr>
                 ) : (
                   coupons.map((coupon) => {
                     const isExpired = new Date(coupon.expiryDate) < new Date();
                     return (
                     <tr key={coupon._id} className={`hover:bg-gray-50/50 ${isExpired ? 'opacity-60' : ''}`}>
                       <td className="px-6 py-4">
                         <div className="font-mono font-bold text-gray-900 border border-gray-200 rounded px-2 py-0.5 inline-block bg-white shadow-sm">{coupon.code}</div>
                         <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{coupon.discountType}</div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-bold text-green-600 text-base">
                           {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                         </div>
                         {coupon.maxDiscount && <div className="text-xs text-gray-500 mt-0.5">Upto ₹{coupon.maxDiscount}</div>}
                       </td>
                       <td className="px-6 py-4">
                         <div className="text-xs text-gray-600 mb-1">
                           <span className="font-semibold text-gray-400 w-12 inline-block">Min:</span> 
                           {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'None'}
                         </div>
                         <div className="text-xs text-gray-600">
                           <span className="font-semibold text-gray-400 w-12 inline-block">Expiry:</span>
                           {new Date(coupon.expiryDate).toLocaleDateString()}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                         {isExpired ? (
                           <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wider">Expired</span>
                         ) : (
                           <div className="text-xs">
                             <span className="text-green-600 font-semibold">• Active</span>
                             <div className="text-gray-400 mt-1 text-[10px]">
                               {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ' used'}
                             </div>
                           </div>
                         )}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDelete(coupon._id, coupon.code)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
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
