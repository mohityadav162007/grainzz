'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createOrder, initiatePayment } from '@/lib/api';

export default function CheckoutPage() {
  const { items, subtotal, discount, total, coupon, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      // Create order
      const orderRes = await createOrder({
        items: items.map((i) => ({
          product: i._id,
          name: i.name,
          image: i.image,
          price: i.price,
          mrp: i.mrp,
          quantity: i.quantity,
        })),
        userDetails: form,
        subtotal: subtotal(),
        couponCode: coupon?.code || '',
        discountAmount: discount(),
        totalAmount: total(),
      });

      const orderId = orderRes.data._id;

      // Initiate PhonePe payment
      try {
        const payRes = await initiatePayment({ orderId, amount: total(), userPhone: form.phone });
        if (payRes.data?.redirectUrl) {
          clearCart();
          window.location.href = payRes.data.redirectUrl;
          return;
        }
      } catch {
        // Payment gateway error - still go to success page for demo
      }

      clearCart();
      router.push(`/payment/success?orderId=${orderId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-text-muted">Your cart is empty</p>
        <Link href="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link href="/products" className="hover:text-primary">Shop</Link>
        <ChevronRight size={14} />
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight size={14} />
        <span className="text-text-main">Checkout</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-black mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left – Customer Form */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Full Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    placeholder="Rahul Kumar" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Phone Number *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange}
                    placeholder="9876543210" className="input-field" type="tel" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Email Address</label>
                  <input name="email" value={form.email} onChange={handleChange}
                    placeholder="rahul@email.com" className="input-field" type="email" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Address *</label>
                  <textarea name="address" required value={form.address} onChange={handleChange as any}
                    placeholder="House/Flat No, Street, Area" rows={2} className="input-field resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">City *</label>
                    <input name="city" required value={form.city} onChange={handleChange}
                      placeholder="Delhi" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">State *</label>
                    <input name="state" required value={form.state} onChange={handleChange}
                      placeholder="Delhi" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Pincode *</label>
                    <input name="pincode" required value={form.pincode} onChange={handleChange}
                      placeholder="110001" className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">{error}</div>
            )}
          </div>

          {/* Right – Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-text-muted text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>₹{subtotal()}</span>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon?.code})</span>
                    <span>−₹{discount()}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted text-xs">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between text-base font-black border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{total()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-4 mt-5 rounded-xl text-base disabled:opacity-60"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Place Order & Pay'}
              </button>
              <p className="text-xs text-center text-text-muted mt-3">🔒 Secure payment powered by PhonePe</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
