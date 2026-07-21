'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from '@/components/ui/OptimizedImage';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight,
  ChevronRight, Shield, Truck, RefreshCw, Lock,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { applyCoupon as apiApplyCoupon } from '@/lib/api';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity,
    subtotal, discount, total, coupon, applyCoupon, removeCoupon,
    clearCart, setQuickBuy,
  } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await apiApplyCoupon(couponCode.trim(), subtotal());
      applyCoupon(res.data);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    setQuickBuy(null);
    router.push('/checkout');
  };

  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
  const savedAmount = mrpTotal - subtotal();

  /* ── Empty State ───────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF7] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-[#EAEAEA]">
            <ShoppingBag size={64} className="text-[#CCCCCC]" />
          </div>
          <h1 className="text-[32px] font-black text-brand-black tracking-tight mb-4 font-brand">
            Your cart is empty
          </h1>
          <p className="text-[16px] text-[#666666] font-medium mb-10 leading-relaxed">
            Looks like you haven't added anything yet. Explore our healthy grain snacks!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-brand-green text-white font-bold text-[17px] px-10 py-4 rounded-full hover:bg-[#154617] transition-all duration-300 shadow-[0_4px_20px_rgba(29,94,32,0.25)]"
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main Cart ─────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <nav className="flex items-center gap-2 text-[13px] text-[#888] mb-3">
            <Link href="/" className="hover:text-brand-green transition-colors font-medium">Home</Link>
            <ChevronRight size={13} />
            <Link href="/products" className="hover:text-brand-green transition-colors font-medium">Shop</Link>
            <ChevronRight size={13} />
            <span className="text-brand-black font-semibold">Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] md:text-[36px] font-black text-brand-black tracking-tight font-brand">
              Your Cart
              <span className="ml-3 text-[18px] font-bold text-[#888] font-sans">
                ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </h1>
            <button
              onClick={clearCart}
              className="text-[13px] font-semibold text-[#999] hover:text-brand-red transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Left Column: Items ─────────────────────────── */}
          <div className="space-y-4">
            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAEAEA] grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'With coupon' },
                { icon: Shield, label: '100% Secure', sub: 'Encrypted checkout' },
                { icon: RefreshCw, label: 'Easy Returns', sub: '7-day return policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 py-1">
                  <div className="w-9 h-9 bg-[#F0F7F0] rounded-full flex items-center justify-center mb-1">
                    <Icon size={18} className="text-brand-green" />
                  </div>
                  <span className="text-[12px] font-bold text-brand-black">{label}</span>
                  <span className="text-[11px] text-[#888] font-medium">{sub}</span>
                </div>
              ))}
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#EAEAEA] p-5 flex gap-4 hover:border-[#CCCCCC] transition-colors group"
                >
                  {/* Product Image */}
                  <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden bg-[#FCF9F2] flex-shrink-0 border border-[#EAEAEA]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[32px]">📦</div>
                    )}
                    {item.mrp > item.price && (
                      <div className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        -{Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[16px] md:text-[18px] font-bold text-brand-black leading-tight mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[11px] font-semibold text-[#666] bg-[#F5F5F5] px-2.5 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 mt-2">
                          <span className="text-[20px] font-black text-brand-black">₹{item.price}</span>
                          {item.mrp > item.price && (
                            <>
                              <span className="text-[14px] text-[#999] line-through font-medium">₹{item.mrp}</span>
                              <span className="text-[13px] font-bold text-brand-green">
                                Save ₹{(item.mrp - item.price) * item.quantity}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-full text-[#CCCCCC] hover:text-brand-red hover:bg-[#FFF5F5] transition-all flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Qty Control */}
                      <div className="flex items-center border-2 border-[#E8E8E8] rounded-full bg-white overflow-hidden hover:border-brand-green transition-colors">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#FCF9F2] transition-colors text-brand-black"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-10 text-center text-[15px] font-black text-brand-black select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#FCF9F2] transition-colors text-brand-black"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <p className="text-[11px] font-medium text-[#999] uppercase tracking-wide">Item Total</p>
                        <p className="text-[20px] font-black text-brand-black">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5">
              <button
                onClick={() => setCouponOpen(!couponOpen)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2.5 text-brand-green font-bold text-[15px]">
                  <Tag size={18} />
                  <span>Apply Discount Code</span>
                </div>
                <span className={`text-[#888] text-[20px] font-light transition-transform duration-300 ${couponOpen ? 'rotate-45' : ''}`}>+</span>
              </button>

              {couponOpen && (
                <div className="mt-4 animate-slide-up">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-[#F0FFF3] border border-[#86EFAC] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-[14px] font-black text-brand-green">{coupon.code}</p>
                        <p className="text-[13px] font-semibold text-[#16a34a]">Saving you ₹{coupon.discountAmount}!</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-brand-red text-[13px] font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="GRAIN10, HEALTH20..."
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1 border-2 border-[#EAEAEA] rounded-xl px-4 py-3 text-[15px] font-semibold focus:outline-none focus:border-brand-green transition-colors placeholder:text-[#BBBBBB]"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="bg-brand-black text-white font-bold text-[14px] px-6 rounded-xl disabled:opacity-50 hover:bg-[#333] transition-colors"
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-brand-red text-[13px] font-semibold mt-2">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Order Summary ─────────────────── */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-sm">
              {/* Summary Header */}
              <div className="bg-[#1D5E20] px-6 py-5">
                <h2 className="text-[20px] font-black text-white tracking-tight">Order Summary</h2>
                <p className="text-[13px] text-white/70 font-medium mt-0.5">
                  {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Price Rows */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="font-medium text-[#666]">MRP Total</span>
                    <span className="font-semibold text-[#999] line-through">₹{mrpTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="font-medium text-[#666]">Subtotal</span>
                    <span className="font-bold text-brand-black">₹{subtotal()}</span>
                  </div>
                  {savedAmount > 0 && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-semibold text-brand-green">Product Savings</span>
                      <span className="font-bold text-brand-green">−₹{savedAmount}</span>
                    </div>
                  )}
                  {discount() > 0 && (
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-semibold text-brand-green">Coupon ({coupon?.code})</span>
                      <span className="font-bold text-brand-green">−₹{discount()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="font-medium text-[#666]">Shipping</span>
                    <span className="font-semibold text-[#16a34a]">
                      {coupon?.freeShipping ? 'FREE' : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-dashed border-[#EAEAEA] pt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[13px] font-medium text-[#888] uppercase tracking-wide">Total Payable</p>
                      {(savedAmount + discount()) > 0 && (
                        <p className="text-[12px] font-semibold text-[#16a34a] mt-0.5">
                          You save ₹{savedAmount + discount()} total!
                        </p>
                      )}
                    </div>
                    <p className="text-[32px] font-black text-brand-black leading-none">₹{total()}</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-green text-white font-black text-[17px] h-[60px] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#154617] transition-all duration-300 shadow-[0_4px_20px_rgba(29,94,32,0.25)] hover:shadow-[0_6px_28px_rgba(29,94,32,0.35)] hover:scale-[1.01] active:scale-[0.99] mt-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>

                {/* Secure Payment */}
                <div className="flex items-center justify-center gap-2 text-[12px] text-[#AAA] font-medium mt-1">
                  <Shield size={14} />
                  Secured by 256-bit SSL encryption
                </div>

                {/* Payment Methods */}
                <div className="border-t border-[#F0F0F0] pt-4 text-center">
                  <p className="text-[11px] font-bold text-[#BBB] uppercase tracking-widest mb-2">We Accept</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {['UPI', 'Visa', 'Mastercard', 'PhonePe', 'GPay'].map((m) => (
                      <span key={m} className="text-[11px] font-bold text-[#888] bg-[#F5F5F5] px-3 py-1.5 rounded-lg border border-[#EAEAEA]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="mt-4 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#666] hover:text-brand-green transition-colors py-3"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

