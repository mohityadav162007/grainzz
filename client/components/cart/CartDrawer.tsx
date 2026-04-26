'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import { applyCoupon as apiApplyCoupon } from '@/lib/api';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    subtotal, discount, total, coupon, applyCoupon, removeCoupon,
  } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeCart();
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full flex flex-col animate-slide-in-right shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold">Your Cart ({items.length})</h2>
          <button onClick={closeCart} className="p-1 hover:text-primary transition-colors">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <ShoppingBag size={64} className="text-gray-200" />
            <p className="text-text-muted font-medium">Your cart is empty</p>
            <button onClick={closeCart} className="btn-primary">Continue Shopping</button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-5 py-2 text-xs text-text-muted border-b flex justify-between">
                <span>Product</span><span>Total</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4 border-b">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full bg-cream" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-text-muted line-through">MRP ₹{item.mrp}</span>
                      )}
                    </div>
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-accent transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t bg-cream-100">
              {/* Discount Code */}
              <div className="px-5 py-3 border-b">
                <button
                  onClick={() => setCouponOpen(!couponOpen)}
                  className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2"><Tag size={16} /> Discount Code</span>
                  <span className={`transition-transform ${couponOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {couponOpen && (
                  <div className="mt-3">
                    {coupon ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-green-700">{coupon.code} applied! −₹{coupon.discountAmount}</span>
                        <button onClick={removeCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="input-field flex-1 text-xs py-2"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon}
                          className="btn-primary text-xs py-2 rounded-lg"
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-accent mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="px-5 py-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{subtotal()}</span>
                    <span className="text-text-muted line-through text-xs">
                      MRP ₹{items.reduce((s, i) => s + i.mrp * i.quantity, 0)}
                    </span>
                  </div>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span><span>−₹{discount()}</span>
                  </div>
                )}
                <p className="text-xs text-text-muted">Shipping &amp; taxes calculated at checkout</p>
              </div>

              {/* Checkout CTA */}
              <div className="px-5 pb-5">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-text-main text-white text-center py-4 rounded-xl font-semibold text-sm
                    hover:bg-primary transition-colors duration-200 block"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
