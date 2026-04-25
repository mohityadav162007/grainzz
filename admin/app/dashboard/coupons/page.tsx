'use client';
import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, deleteCoupon } from '@/lib/api';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await createCoupon({
        code: form.get('code') as string,
        discountType: form.get('discountType') as string,
        value: Number(form.get('value')),
        minOrderValue: Number(form.get('minOrderValue') || 0),
        maxDiscount: Number(form.get('maxDiscount') || 0) || undefined,
        expiryDate: form.get('expiryDate') as string,
        usageLimit: Number(form.get('usageLimit') || 0) || undefined,
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn">
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">Create Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Code *</label>
              <input name="code" required className="admin-input" placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
              <select name="discountType" required className="admin-input">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Value *</label>
              <input name="value" type="number" required className="admin-input" placeholder="20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order (₹)</label>
              <input name="minOrderValue" type="number" className="admin-input" defaultValue={0} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Discount (₹)</label>
              <input name="maxDiscount" type="number" className="admin-input" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date *</label>
              <input name="expiryDate" type="date" required className="admin-input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Usage Limit</label>
              <input name="usageLimit" type="number" className="admin-input" placeholder="Unlimited" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Coupon'}
          </button>
        </form>
      )}

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No coupons yet.</td></tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiry_date) < new Date();
                  return (
                    <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold font-mono">{coupon.code}</td>
                      <td className="px-6 py-4 capitalize">{coupon.discount_type}</td>
                      <td className="px-6 py-4 font-semibold">{coupon.discount_type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                      <td className="px-6 py-4">₹{coupon.min_order_value}</td>
                      <td className="px-6 py-4">{coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : '/∞'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700' : coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isExpired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(coupon.id, coupon.code)} className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition-colors">
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
