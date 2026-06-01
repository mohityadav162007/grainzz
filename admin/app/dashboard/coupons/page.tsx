'use client';
import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';
import { Plus, Trash2, Edit2, Loader2, X, Truck } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

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

  // Sync toggle state when opening form for editing
  useEffect(() => {
    if (editingCoupon) {
      setIsFreeShipping(editingCoupon.free_shipping === true);
    } else {
      setIsFreeShipping(false);
    }
  }, [editingCoupon]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const maxDiscountVal = form.get('maxDiscount') ? Number(form.get('maxDiscount')) : 0;
    const usageLimitVal = form.get('usageLimit') ? Number(form.get('usageLimit')) : 0;

    // Enforce mutually exclusive modes
    const payload = isFreeShipping
      ? {
          // Free Shipping mode: no discount fields
          code: form.get('code') as string,
          discountType: 'flat',        // safe default (will not be used)
          value: 0,                     // no monetary discount
          minOrderValue: Number(form.get('minOrderValue') || 0),
          maxDiscount: 0,               // not applicable
          expiryDate: form.get('expiryDate') as string,
          usageLimit: usageLimitVal,
          isActive: form.get('isActive') !== 'false',
          isVisible: form.get('isVisible') !== 'false',
          isFirstOrderOnly: form.get('isFirstOrderOnly') !== 'false',
          freeShipping: true,
        }
      : {
          // Discount mode: normal coupon
          code: form.get('code') as string,
          discountType: form.get('discountType') as string,
          value: Number(form.get('value')),
          minOrderValue: Number(form.get('minOrderValue') || 0),
          maxDiscount: maxDiscountVal,
          expiryDate: form.get('expiryDate') as string,
          usageLimit: usageLimitVal,
          isActive: form.get('isActive') !== 'false',
          isVisible: form.get('isVisible') !== 'false',
          isFirstOrderOnly: form.get('isFirstOrderOnly') !== 'false',
          freeShipping: false,
        };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setShowForm(true);
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
        <button onClick={() => { setShowForm(!showForm); setEditingCoupon(null); }} className="admin-btn">
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> New Coupon</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>

          {/* Free Shipping Toggle — placed first for prominence */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
            <Truck size={20} className={isFreeShipping ? 'text-green-600' : 'text-gray-400'} />
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-800">Free Shipping Coupon</label>
              <p className="text-xs text-gray-500 mt-0.5">
                {isFreeShipping
                  ? 'This coupon only removes shipping charges. No monetary discount.'
                  : 'Toggle ON to make this a free shipping-only coupon.'}
              </p>
            </div>
            <select
              value={isFreeShipping ? 'true' : 'false'}
              onChange={(e) => setIsFreeShipping(e.target.value === 'true')}
              className="admin-input w-24 text-center font-bold"
            >
              <option value="false">OFF</option>
              <option value="true">ON</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Always visible: Coupon Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Code *</label>
              <input name="code" required className="admin-input" placeholder="SAVE20" defaultValue={editingCoupon?.code} />
            </div>

            {/* Only show when NOT free shipping: Discount Type */}
            {!isFreeShipping && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                <select name="discountType" required className="admin-input" defaultValue={editingCoupon?.discount_type || 'percentage'}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
            )}

            {/* Only show when NOT free shipping: Discount Value */}
            {!isFreeShipping && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Value *</label>
                <input name="value" type="number" required className="admin-input" placeholder="20" defaultValue={editingCoupon?.value} />
              </div>
            )}

            {/* Always visible: Min Order Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order (₹)</label>
              <input name="minOrderValue" type="number" className="admin-input" defaultValue={editingCoupon?.min_order_value || 0} />
            </div>

            {/* Only show when NOT free shipping: Max Discount */}
            {!isFreeShipping && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Discount (₹)</label>
                <input name="maxDiscount" type="number" className="admin-input" placeholder="Optional" defaultValue={editingCoupon?.max_discount || ''} />
              </div>
            )}

            {/* Always visible: Expiry Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date *</label>
              <input name="expiryDate" type="date" required className="admin-input" defaultValue={editingCoupon ? new Date(editingCoupon.expiry_date).toISOString().split('T')[0] : ''} />
            </div>

            {/* Always visible: Usage Limit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Usage Limit</label>
              <input name="usageLimit" type="number" className="admin-input" placeholder="Unlimited" defaultValue={editingCoupon?.usage_limit || ''} />
            </div>

            {/* Always visible: Checkboxes */}
            <div className="flex items-center gap-3 pt-6 md:col-span-1">
              <input name="isVisible" type="checkbox" value="true" defaultChecked={editingCoupon ? editingCoupon.is_visible !== false : true} className="w-4 h-4 rounded border-gray-300" />
              <label className="text-sm font-semibold text-gray-700">Visible to Clients</label>
              <input type="hidden" name="isVisible" value="false" />
            </div>
            <div className="flex items-center gap-3 pt-6 md:col-span-1">
              <input name="isFirstOrderOnly" type="checkbox" value="true" defaultChecked={editingCoupon ? editingCoupon.is_first_order_only === true : false} className="w-4 h-4 rounded border-gray-300" />
              <label className="text-sm font-semibold text-gray-700">First Order Only</label>
              <input type="hidden" name="isFirstOrderOnly" value="false" />
            </div>
            {editingCoupon && (
              <div className="flex items-center gap-3 pt-6 md:col-span-1">
                <input name="isActive" type="checkbox" value="true" defaultChecked={editingCoupon.is_active} className="w-4 h-4 rounded border-gray-300" />
                <label className="text-sm font-semibold text-gray-700">Is Active</label>
                <input type="hidden" name="isActive" value="false" />
              </div>
            )}
          </div>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? <><Loader2 size={18} className="animate-spin" /> {editingCoupon ? 'Saving...' : 'Creating...'}</> : (editingCoupon ? 'Save Changes' : 'Create Coupon')}
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
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No coupons yet.</td></tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiry_date) < new Date();
                  const isFreeShipCoupon = coupon.free_shipping === true;
                  return (
                    <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold font-mono">{coupon.code}</td>
                      <td className="px-6 py-4 capitalize">
                        {isFreeShipCoupon ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 inline-flex items-center gap-1">
                            <Truck size={12} /> Free Shipping
                          </span>
                        ) : coupon.discount_type}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {isFreeShipCoupon
                          ? '—'
                          : coupon.discount_type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </td>
                      <td className="px-6 py-4">₹{coupon.min_order_value}</td>
                      <td className="px-6 py-4">{coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : '/∞'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700' : coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isExpired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${coupon.is_visible !== false ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {coupon.is_visible !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold block w-fit ${coupon.is_first_order_only ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                          {coupon.is_first_order_only ? 'First Order' : 'All Orders'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(coupon)} className="w-8 h-8 rounded-lg text-primary hover:bg-primary/10 inline-flex items-center justify-center transition-colors">
                          <Edit2 size={16} />
                        </button>
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
