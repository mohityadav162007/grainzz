'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { applyCoupon as apiApplyCoupon, getActiveCoupons } from '@/lib/api';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    subtotal, discount, total, coupon, applyCoupon, removeCoupon,
    setQuickBuy,
  } = useCartStore();
  const { user, setAuthModalOpen, setGuestPopupMode } = useAuthStore();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const drawerRef = null;

  useEffect(() => {
    if (isOpen) {
      setLoadingCoupons(true);
      getActiveCoupons()
        .then((data) => setCouponsList(data))
        .catch((err) => console.error('Error fetching active coupons:', err))
        .finally(() => setLoadingCoupons(false));
    }
  }, [isOpen]);

  const handleCheckout = () => {
    setQuickBuy(null);
    closeCart();
    router.push('/checkout');
  };

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

  const handleApplySuggestedCoupon = async (code: string) => {
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await apiApplyCoupon(code, subtotal());
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative w-[400px] max-w-[85vw] bg-white h-full flex flex-col animate-slide-in-right shadow-[-10px_0_40px_rgba(0,0,0,0.1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[#EAEAEA] bg-[#FCF9F2]">
          <h2 className="text-[20px] md:text-[24px] font-bold text-brand-black m-0 tracking-tight font-brand flex items-center gap-[8px]">
            Your Cart 
            <span className="bg-brand-red text-white text-[12px] px-[8px] py-[2px] rounded-full">{items.length}</span>
          </h2>
          <button 
            onClick={closeCart} 
            className="w-[36px] h-[36px] rounded-full border border-[#CCCCCC] flex items-center justify-center hover:scale-105 transition-transform bg-white text-brand-black"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-[24px] text-center px-[32px] bg-white">
            <div className="w-[100px] h-[100px] bg-[#FCF9F2] rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-[#CCCCCC]" />
            </div>
            <h3 className="text-[24px] font-bold text-brand-black tracking-tight m-0">Your cart is empty</h3>
            <p className="text-[16px] text-[#666666] font-medium m-0">Looks like you haven't added anything to your cart yet.</p>
            <button 
              onClick={closeCart} 
              className="mt-[8px] bg-brand-green text-white font-bold text-[16px] px-[32px] py-[16px] rounded-full hover:bg-[#154617] transition-colors shadow-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto bg-white">
              {items.map((item) => (
                <div key={item.id} className="flex gap-[16px] p-[24px] border-b border-[#EAEAEA]">
                  {/* Image */}
                  <div className="w-[80px] h-[80px] relative rounded-[12px] overflow-hidden bg-[#FCF9F2] flex-shrink-0 border border-[#EAEAEA]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[24px]">📦</div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-[8px]">
                      <h3 className="text-[16px] font-bold text-brand-black leading-[1.3] truncate-2-lines">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="text-[#999999] hover:text-brand-red transition-colors p-[4px]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-[8px] mt-[4px]">
                      <span className="text-[16px] font-bold text-brand-black">₹{item.price}</span>
                      {item.mrp > item.price && (
                        <span className="text-[13px] text-[#8E8E8E] line-through font-medium">₹{item.mrp}</span>
                      )}
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-[12px]">
                      <div className="flex items-center border border-[#CCCCCC] rounded-full bg-white max-w-[100px]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#FCF9F2] transition-colors rounded-l-full text-brand-black"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center text-[14px] font-bold text-brand-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#FCF9F2] transition-colors rounded-r-full text-brand-black"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-[16px] font-bold text-brand-black">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-[#EAEAEA] bg-[#FCF9F2] p-[24px]">
              
              {/* Discount Code */}
              <div className="mb-[24px]">
                <button
                  onClick={() => setCouponOpen(!couponOpen)}
                  className="flex items-center gap-[8px] text-[14px] font-bold text-brand-green hover:text-[#154617] transition-colors w-max"
                >
                  <Tag size={16} /> <span>Add Discount Code</span>
                  <span className={`transform transition-transform ${couponOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {couponOpen && (
                  <div className="mt-[12px] animate-fade-in">
                    {coupon ? (
                      <div className="flex items-center justify-between bg-white border border-[#1E8A38] rounded-[12px] px-[16px] py-[12px] shadow-sm">
                        <span className="text-[14px] font-bold text-[#1E8A38]">{coupon.code} applied! (−₹{coupon.discountAmount})</span>
                        <button onClick={removeCoupon} className="text-[#D72638] text-[13px] font-bold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex bg-white rounded-[12px] border border-[#CCCCCC] p-[4px] shadow-sm focus-within:border-brand-green transition-colors">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          className="flex-1 text-[14px] px-[16px] py-[8px] bg-transparent outline-none font-medium placeholder-[#999999]"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="bg-brand-black text-white text-[13px] font-bold px-[20px] rounded-[8px] disabled:opacity-50 hover:bg-[#333333] transition-colors"
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[13px] text-brand-red font-bold mt-[8px]">{couponError}</p>}
                    
                    {/* Suggestions List */}
                    {!loadingCoupons && couponsList.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-[11px] font-extrabold uppercase text-gray-500 tracking-wider">Available Coupons</h4>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                          {couponsList.map((cp) => {
                            const minOrder = Number(cp.min_order_value || 0);
                            const currentCartTotal = subtotal();
                            const isLocked = currentCartTotal < minOrder;
                            const isCurrentlyApplied = coupon?.code === cp.code;
                            const amountNeeded = minOrder - currentCartTotal;

                            let benefitText = '';
                            if (cp.free_shipping) {
                              benefitText = 'FREE SHIPPING';
                            } else if (cp.discount_type === 'percentage') {
                              benefitText = `${Number(cp.value)}% OFF`;
                            } else {
                              benefitText = `₹${Number(cp.value)} OFF`;
                            }

                            return (
                              <div
                                key={cp.id}
                                className={`p-3 rounded-xl border transition-all duration-300 bg-white ${
                                  isCurrentlyApplied
                                    ? 'border-[#1E8A38] bg-[#1E8A38]/5'
                                    : isLocked
                                    ? 'border-gray-200 opacity-75'
                                    : 'border-brand-green/20 hover:border-[#1E8A38]/40'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-bold text-[12px] text-brand-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                        {cp.code}
                                      </span>
                                      <span className="text-[11px] font-extrabold text-brand-green">
                                        {benefitText}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                      Min Order: ₹{minOrder}
                                    </p>
                                  </div>
                                  <div>
                                    {isCurrentlyApplied ? (
                                      <span className="text-[11px] font-bold text-[#1E8A38] bg-[#1E8A38]/10 px-2 py-1 rounded">Applied</span>
                                    ) : isLocked ? (
                                      <div className="text-right">
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                          <Lock size={10} /> Locked
                                        </span>
                                        <p className="text-[9px] text-brand-red font-semibold mt-1">
                                          Add ₹{amountNeeded} more
                                        </p>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleApplySuggestedCoupon(cp.code)}
                                        className="bg-brand-green text-white text-[11px] font-bold px-3 py-1 rounded-lg hover:bg-[#154617] transition-all"
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-[12px] mb-[24px]">
                <div className="flex justify-between items-center text-[15px] font-medium text-[#666666]">
                  <span>Subtotal</span>
                  <div className="flex gap-[8px] items-center">
                    <span className="line-through text-[#999999] text-[13px]">
                      ₹{items.reduce((s, i) => s + i.mrp * i.quantity, 0)}
                    </span>
                    <span className="text-brand-black font-bold text-[16px]">₹{subtotal()}</span>
                  </div>
                </div>
                
                {discount() > 0 && (
                  <div className="flex justify-between items-center text-[15px] font-bold text-[#1E8A38]">
                    <span>Discount</span>
                    <span>−₹{discount()}</span>
                  </div>
                )}
                
                <div className="w-full h-[1px] bg-[#EAEAEA] my-[12px]" />
                
                <div className="flex justify-between items-end">
                  <span className="text-[18px] font-bold text-brand-black font-brand tracking-tight">Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[24px] font-bold text-brand-black leading-none mb-[4px]">₹{total()}</span>
                    <span className="text-[12px] font-medium text-[#999999]">Shipping calculated at checkout</span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full bg-brand-green text-white text-center h-[56px] flex items-center justify-center gap-2 rounded-[40px] font-bold text-[18px] hover:bg-[#154617] transition-all duration-300 shadow-[0_4px_16px_rgba(29,94,32,0.2)] tracking-wide"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
