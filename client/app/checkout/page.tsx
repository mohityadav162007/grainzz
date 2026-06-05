'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Loader2, Check, MapPin, Package, CreditCard, Truck, Clock, Tag, Minus, Plus } from 'lucide-react';
import { useCartStore, validateCoupon, calculateDiscount, type CouponData } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder, initiatePayment, getShippingRates, getSavedAddresses, getProductById, applyCoupon as apiApplyCoupon, type SavedAddress } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { calculateAggregatedPackage } from '@/lib/shipping';

declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (config: any) => void;
    };
  }
}

const COMBO_CATEGORIES = ['Combos', 'Gift Packs', '2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack'];

export default function CheckoutPage() {
  const {
    items,
    quickBuyItem,
    subtotal,
    discount,
    total,
    coupon,
    clearCart,
    setQuickBuy,
    removeCoupon,
    applyCoupon,
    revalidateCouponState,
    updateQuantity
  } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (quickBuyItem) {
      if (newQty < 1) {
        setQuickBuy(null);
        router.push('/cart');
      } else {
        setQuickBuy({ ...quickBuyItem, quantity: newQty });
        setTimeout(() => revalidateCouponState(false), 0);
      }
    } else {
      updateQuantity(itemId, newQty);
    }
  };

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Existing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
  });

  // Shipping state
  const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  const [calculatedShippingCharge, setCalculatedShippingCharge] = useState<number | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);

  // Product metadata for shipping calculation
  const [productMetadata, setProductMetadata] = useState<Record<string, { length: number; breadth: number; height: number; weight: number }>>({});
  const [hasCombo, setHasCombo] = useState(false);

  // Coupon states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [suggestedCoupons, setSuggestedCoupons] = useState<CouponData[]>([]);

  // Silent mount revalidation for Quick Buy state
  useEffect(() => {
    revalidateCouponState(false);
  }, []);

  const displayItems = quickBuyItem ? [quickBuyItem] : items;
  const displaySubtotal = quickBuyItem ? quickBuyItem.price * quickBuyItem.quantity : subtotal();
  const displayDiscount = coupon ? calculateDiscount(coupon, displaySubtotal) : 0;
  const displayTotal = Math.max(displaySubtotal - displayDiscount, 0);
  const finalTotal = displayTotal + (shippingCharge || 0);

  // Fetch suggested coupons for current order subtotal
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data: couponsData, error: fetchError } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .eq('is_visible', true);

        if (fetchError || !couponsData) return;

        const now = new Date();
        const filtered: CouponData[] = [];

        for (const c of couponsData) {
          if (new Date(c.expiry_date) < now) continue;
          if (c.usage_limit !== null && c.used_count >= c.usage_limit) continue;

          try {
            const cleanFormEmail = form.email?.trim().toLowerCase() || '';
            const verifyRes = await fetch(`/api/coupons/verify?code=${encodeURIComponent(c.code)}&email=${encodeURIComponent(cleanFormEmail || user?.email || '')}&userId=${encodeURIComponent(user?.id || '')}`);
            const verifyData = await verifyRes.json();
            if (verifyData.used) continue;
          } catch (e) {
            console.error('Coupon verify error', e);
          }

          filtered.push({
            code: c.code,
            discountType: c.discount_type,
            value: Number(c.value),
            discountAmount: 0,
            minOrderValue: Number(c.min_order_value || 0),
            maxDiscount: c.max_discount !== null ? Number(c.max_discount) : null,
            expiryDate: c.expiry_date,
            usageLimit: c.usage_limit,
            usedCount: c.used_count,
            isActive: c.is_active,
            freeShipping: c.free_shipping || false,
          });
        }

        setSuggestedCoupons(filtered);
      } catch (err) {
        console.error('Failed to fetch coupon suggestions:', err);
      }
    };

    fetchSuggestions();
  }, [displaySubtotal, user]);

  const handleApplyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    setError('');

    try {
      const cleanFormEmail = form.email?.trim().toLowerCase() || '';
      const verifyRes = await fetch(`/api/coupons/verify?code=${encodeURIComponent(cleanCode)}&email=${encodeURIComponent(cleanFormEmail || user?.email || '')}&userId=${encodeURIComponent(user?.id || '')}`);
      const verifyData = await verifyRes.json();
      
      if (verifyData.used) {
        throw new Error('You have already used this coupon.');
      }

      const res = await apiApplyCoupon(cleanCode, displaySubtotal);
      applyCoupon(res.data);
      setCouponSuccess(`Coupon "${cleanCode}" applied successfully!`);
      setCouponCodeInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // If the user modifies their cart or quick buy item after initiating a checkout,
  // we must discard the pending order so a new one is created with updated items/totals.
  useEffect(() => {
    setPendingOrderId(null);
  }, [items, quickBuyItem, total]);

  // Load saved addresses on mount
  useEffect(() => {
    if (user?.id) {
      setSavedAddressesLoading(true);
      getSavedAddresses(user.id)
        .then(addrs => {
          setSavedAddresses(addrs);
          // Auto-fill default address
          const defaultAddr = addrs.find(a => a.is_default);
          if (defaultAddr && !form.name) {
            setForm({
              name: defaultAddr.full_name,
              phone: defaultAddr.phone,
              email: form.email || user.email || '',
              address: defaultAddr.address_line_1 + (defaultAddr.address_line_2 ? ', ' + defaultAddr.address_line_2 : ''),
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            });
          }
        })
        .catch(() => {})
        .finally(() => setSavedAddressesLoading(false));
    }
  }, [user?.id]);

  // Revalidate coupon on checkout page mount
  useEffect(() => {
    revalidateCouponState(false);
  }, []);

  // Fetch product package dimensions & weights for shipping calculation
  useEffect(() => {
    const fetchMetadata = async () => {
      const meta: Record<string, { length: number; breadth: number; height: number; weight: number }> = {};
      let comboDetected = false;
      for (const item of displayItems) {
        try {
          const product = await getProductById(item.id);
          if (product) {
            // Apply default fallbacks if any package field is null or zero: L=15, B=15, H=10, W=0.5
            const length = Number(product.package_length) || 15;
            const breadth = Number(product.package_breadth) || 15;
            const height = Number(product.package_height) || 10;
            const weight = Number(product.package_weight) || 0.5;

            meta[item.id] = { length, breadth, height, weight };

            if (COMBO_CATEGORIES.includes(product.category)) {
              comboDetected = true;
            }
          }
        } catch (err) {
          console.error(`Failed to fetch metadata for product ${item.id}:`, err);
        }
      }
      setProductMetadata(meta);
      setHasCombo(comboDetected);
    };
    if (displayItems.length > 0) fetchMetadata();
  }, [displayItems]);

  // Aggregation of package weights and dimensions (stacking model)
  const getAggregatedPackages = () => {
    const pkgItems = displayItems.map((item) => {
      const meta = productMetadata[item.id] || { length: 15, breadth: 15, height: 10, weight: 0.5 };
      return {
        package_length: meta.length,
        package_breadth: meta.breadth,
        package_height: meta.height,
        package_weight: meta.weight,
        quantity: item.quantity || 1,
      };
    });
    return calculateAggregatedPackage(pkgItems);
  };

  const recalculateShippingCharge = async (pincodeOverride?: string): Promise<boolean> => {
    const activePincode = pincodeOverride || form.pincode;

    if (!activePincode || activePincode.length !== 6 || !/^\d{6}$/.test(activePincode)) {
      if (coupon?.freeShipping) {
        setShippingCharge(0);
        setFreeShipping(true);
        setCalculatedShippingCharge(null);
        return true;
      }
      setShippingCharge(null);
      setFreeShipping(false);
      setCalculatedShippingCharge(null);
      return false;
    }

    setShippingLoading(true);
    setError('');

    try {
      const pkg = getAggregatedPackages();
      const rates = await getShippingRates({
        delivery_pincode: activePincode,
        weight: pkg.weight,
        subtotal: displaySubtotal,
        has_combo: hasCombo,
        length: pkg.length,
        breadth: pkg.breadth,
        height: pkg.height,
      });

      if (rates) {
        const fetchedCharge = rates.shipping_charge || 0;
        setCalculatedShippingCharge(fetchedCharge);
        setEstimatedDelivery(rates.estimated_delivery || '');
        
        if (coupon?.freeShipping) {
          setShippingCharge(0);
          setFreeShipping(true);
        } else {
          setShippingCharge(fetchedCharge);
          setFreeShipping(rates.free_shipping || false);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Shipping calculation error:', err);
      // Failsafe fallback: ₹99 combos, ₹50 single products
      const fallbackCharge = hasCombo ? 99 : 50;
      setCalculatedShippingCharge(fallbackCharge);
      
      if (coupon?.freeShipping) {
        setShippingCharge(0);
        setFreeShipping(true);
      } else {
        setShippingCharge(fallbackCharge);
        setFreeShipping(false);
      }
      return true; // proceed using fallback
    } finally {
      setShippingLoading(false);
    }
  };

  // Trigger dynamic shipping calculation reactively on changes
  useEffect(() => {
    recalculateShippingCharge();
  }, [displayItems, productMetadata, displaySubtotal, displayDiscount, coupon, form.pincode, hasCombo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectSavedAddress = (addr: SavedAddress) => {
    setForm({
      name: addr.full_name,
      phone: addr.phone,
      email: form.email || user?.email || '',
      address: addr.address_line_1 + (addr.address_line_2 ? ', ' + addr.address_line_2 : ''),
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (form.pincode.length !== 6 || !/^\d{6}$/.test(form.pincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return false;
    }
    setError('');
    return true;
  };

  const handleContinueToSummary = async () => {
    if (!validateForm()) return;

    // Verify coupon threshold is still met before proceeding to summary step
    if (coupon) {
      revalidateCouponState(false);
      if (!useCartStore.getState().coupon) {
        setError('Your applied coupon is no longer valid because the minimum order value is no longer met.');
        return;
      }
    }

    const success = await recalculateShippingCharge(form.pincode);
    if (success) {
      setCurrentStep(2);
    } else {
      setError('Failed to calculate shipping. Please enter a valid 6-digit pincode.');
    }
  };

  const handleSubmit = async () => {
    if (displayItems.length === 0) return;

    // Auth gate — guest users must sign in before payment is initiated
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      let orderId = pendingOrderId;

      // Revalidate order coupon one final time before creating the order and payment
      if (coupon) {
        // 1. Confirm user has not used it previously (lifetime check)
        const cleanFormEmail = form.email?.trim().toLowerCase() || '';
        const verifyRes = await fetch(`/api/coupons/verify?code=${encodeURIComponent(coupon.code)}&email=${encodeURIComponent(cleanFormEmail || user?.email || '')}&userId=${encodeURIComponent(user?.id || '')}`);
        const verifyData = await verifyRes.json();

        if (verifyData.used) {
          removeCoupon();
          setError('You have already used this coupon.');
          setLoading(false);
          return;
        }

        // 2. Confirm all threshold and expiry rules
        const currentSubtotal = displaySubtotal;
        const validation = validateCoupon(coupon, currentSubtotal);
        if (!validation.isValid) {
          removeCoupon();
          setError(validation.reason || 'Coupon is no longer valid. Please proceed without it.');
          setLoading(false);
          return;
        }
      }

      // Create order only if we don't have a pending one
      if (!orderId) {
        const orderRes = await createOrder({
          items: displayItems.map((i) => ({
            product_id: i.id,
            name: i.name,
            image: i.image,
            price: i.price,
            mrp: i.mrp,
            quantity: i.quantity,
          })),
          userDetails: form,
          subtotal: displaySubtotal,
          couponCode: coupon?.code || '',
          discountAmount: displayDiscount,
          totalAmount: finalTotal,
          userId: user?.id,
          shippingCharge: shippingCharge || 0,
          estimatedDelivery: estimatedDelivery,
        });
        orderId = orderRes.data.id;
        setPendingOrderId(orderId);
      }

      if (!orderId) {
        throw new Error("Order creation failed.");
      }

      // Initiate PhonePe payment (amount read server-side from DB)
      const payRes = await initiatePayment({ orderId });
      
      const redirectUrl = payRes.data?.redirectUrl;
      
      if (!redirectUrl) {
        throw new Error('Payment gateway did not return checkout URL.');
      }

      // Clear cart before redirecting
      if (quickBuyItem) setQuickBuy(null);
      else clearCart();

      // Try embedded PhonePe SDK first, fallback to redirect
      try {
        if (typeof window !== 'undefined' && window.PhonePeCheckout) {
          // PhonePe SDK is already loaded — use embedded checkout
          window.PhonePeCheckout.transact({
            tokenUrl: redirectUrl,
            type: 'IFRAME', // embedded in-page
            callback: (response: any) => {
              // Payment completed or failed — verify on server
              if (response === 'CONCLUDED' || response === 'USER_CANCEL') {
                router.push(`/payment/verify?orderId=${orderId}`);
              }
            },
          });
          return;
        }
      } catch (sdkError) {
        console.warn('PhonePe SDK not available, using redirect:', sdkError);
      }

      // Fallback: Full page redirect (always works)
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-text-muted">Your cart is empty</p>
        <Link href="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Order Summary', icon: Package },
    { num: 3, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-y-2 gap-x-2 text-sm text-text-muted mb-8">
        <Link href="/products" className="hover:text-primary">Shop</Link>
        <ChevronRight size={14} />
        <Link href="/cart" className="hover:text-primary">Cart</Link>
        <ChevronRight size={14} />
        <span className="text-text-main">Checkout</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-black mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center">
            <button
              onClick={() => {
                if (step.num < currentStep) setCurrentStep(step.num);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-primary text-white shadow-md'
                  : currentStep > step.num
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
              disabled={step.num > currentStep}
            >
              {currentStep > step.num ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <step.icon size={16} />
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.num}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1 min-w-[10px] sm:min-w-[20px] ${
                currentStep > step.num ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: ADDRESS ─────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="grid md:grid-cols-3 gap-8 w-full">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6">
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

            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6">
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

            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <MapPin size={18} /> Saved Addresses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectSavedAddress(addr)}
                      className={`text-left p-4 rounded-xl border transition-all hover:border-primary ${
                        form.pincode === addr.pincode && form.phone === addr.phone && form.name === addr.full_name
                          ? 'border-primary bg-brand-light/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {addr.address_line_1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">{error}</div>
            )}

            <button
              onClick={handleContinueToSummary}
              disabled={shippingLoading}
              className="w-full btn-primary justify-center py-4 rounded-xl text-base disabled:opacity-60"
            >
              {shippingLoading ? <><Loader2 size={18} className="animate-spin" /> Calculating Shipping...</> : 'Continue to Order Summary →'}
            </button>
          </div>

          {/* Right – Quick Summary */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 md:sticky md:top-24">
              <h2 className="font-bold mb-4">Your Cart</h2>
              {quickBuyItem && <div className="text-xs bg-brand-light/50 text-brand-dark px-3 py-1.5 rounded-md mb-3 font-medium">Quick Buy Checkout</div>}
              <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-1">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-text-main">{item.name}</p>
                      
                      {/* Stepper identical to the cart stepper */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center border border-gray-300 rounded-full bg-white w-24 h-7">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-full text-brand-black font-bold"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-brand-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-full text-brand-black font-bold"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-semibold text-text-main block">₹{item.price * item.quantity}</span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] text-text-muted line-through">₹{item.mrp * item.quantity}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Coupon Section */}
              <div className="border-t pt-4 mt-4 space-y-3">
                <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
                  <Tag size={16} className="text-primary" /> Apply Coupon
                </h3>
                
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="text-xs font-bold text-green-700">
                      {coupon.freeShipping ? (
                        <span className="flex items-center gap-1.5">
                          "{coupon.code}" applied — <span className="uppercase">Free Shipping</span>
                        </span>
                      ) : (
                        <>"{coupon.code}" applied (−₹{displayDiscount})</>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCouponSuccess('');
                        setCouponError('');
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value.toUpperCase());
                        setCouponError('');
                        setCouponSuccess('');
                      }}
                      className="flex-1 input-field py-2 text-sm uppercase placeholder-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon(couponCodeInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(couponCodeInput)}
                      disabled={applyingCoupon || !couponCodeInput.trim()}
                      className="bg-brand-black text-white hover:bg-black text-xs font-bold px-4 rounded-xl disabled:opacity-50 transition-colors"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                )}

                {couponError && <p className="text-xs text-red-500 font-bold mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-green-600 font-bold mt-1">{couponSuccess}</p>}

                {/* Suggestions List */}
                {!coupon && suggestedCoupons.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Available Coupons</p>
                    <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                      {suggestedCoupons.map((sug) => {
                        const isLocked = displaySubtotal < sug.minOrderValue;
                        const difference = sug.minOrderValue - displaySubtotal;
                        return (
                          <div
                            key={sug.code}
                            className={`flex items-center justify-between p-2.5 border rounded-xl text-xs transition-colors ${
                              isLocked
                                ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/60'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-black px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                  isLocked ? 'text-amber-700 bg-amber-100' : 'text-primary bg-primary/10'
                                }`}>
                                  {sug.code}
                                </span>
                                {sug.freeShipping && (
                                  <span className="font-black px-1.5 py-0.5 rounded text-[10px] uppercase text-green-700 bg-green-100">
                                    FREE SHIPPING
                                  </span>
                                )}
                              </div>
                              <p className="font-bold text-[11px] text-text-main mt-1">
                                {sug.freeShipping ? (
                                  'FREE SHIPPING'
                                ) : (
                                  <>
                                    {sug.discountType === 'percentage'
                                      ? `${sug.value}% OFF${sug.maxDiscount ? ` up to ₹${sug.maxDiscount}` : ''}`
                                      : `Flat ₹${sug.value} OFF`}
                                  </>
                                )}
                              </p>
                              {sug.minOrderValue > 0 && (
                                <p className="text-[10px] mt-0.5 font-medium">
                                  {isLocked ? (
                                    <span className="text-amber-600">
                                      Add ₹{difference} more to unlock
                                    </span>
                                  ) : (
                                    <span className="text-text-muted">
                                      Min order: ₹{sug.minOrderValue}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isLocked) {
                                  alert(`Minimum order value of ₹${sug.minOrderValue} required to apply this coupon. Please add ₹${difference} more worth of items to your cart!`);
                                } else {
                                  handleApplyCoupon(sug.code);
                                }
                              }}
                              className={`font-black px-2.5 py-1 border rounded-lg shadow-sm text-[11px] transition-all active:scale-95 ${
                                isLocked
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-white text-primary border-gray-200 hover:text-brand-dark hover:bg-gray-50'
                              }`}
                            >
                              {isLocked ? 'Lock' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>₹{displaySubtotal}</span>
                </div>
                {displayDiscount > 0 && !coupon?.freeShipping && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon?.code})</span>
                    <span>−₹{displayDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted text-xs">
                  <span>Shipping</span>
                  <span>Calculated in next step</span>
                </div>
                <div className="flex justify-between text-base font-black border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{displayTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: ORDER SUMMARY ──────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="grid md:grid-cols-3 gap-8 w-full">
          <div className="md:col-span-2 space-y-4 w-full min-w-0">
            {/* Shipping Address Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 w-full overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2 min-w-0"><MapPin size={18} className="shrink-0" /> <span className="truncate">Shipping Address</span></h2>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-primary font-bold hover:underline">Edit</button>
              </div>
              <div className="text-sm text-text-muted leading-relaxed break-words">
                <p className="font-semibold text-text-main">{form.name}</p>
                <p className="break-words">{form.address}</p>
                <p>{form.city}, {form.state} - {form.pincode}</p>
                <p>Phone: {form.phone}</p>
                {form.email && <p className="break-all">Email: {form.email}</p>}
              </div>
            </div>

            {/* Ordered Products */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 w-full overflow-hidden">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Package size={18} /> Order Items</h2>
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0 w-full min-w-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-text-muted mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <span className="font-bold text-sm flex-shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            {estimatedDelivery && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 w-full overflow-hidden">
                <Clock size={20} className="text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-green-800">Estimated Delivery</p>
                  <p className="text-xs text-green-600">{estimatedDelivery}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">{error}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full btn-primary justify-center py-4 rounded-xl text-base"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>

          {/* Right – Price Summary */}
          <div className="md:col-span-1 w-full min-w-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 md:sticky md:top-24 w-full overflow-hidden">
              <h2 className="font-bold mb-4">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>₹{displaySubtotal}</span>
                </div>
                {displayDiscount > 0 && !coupon?.freeShipping && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon?.code})</span>
                    <span>−₹{displayDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1 min-w-0"><Truck size={14} className="shrink-0" /> <span className="truncate">Shipping</span></span>
                  <span className={freeShipping ? 'text-green-600 font-bold' : ''}>
                    {freeShipping ? (
                      coupon?.freeShipping && calculatedShippingCharge ? (
                        <span className="flex items-center gap-1.5 justify-end">
                          <span className="text-gray-400 line-through font-normal text-xs">₹{calculatedShippingCharge}</span>
                          <span>FREE</span>
                        </span>
                      ) : 'FREE'
                    ) : `₹${shippingCharge || 0}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: PAYMENT ────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <h2 className="font-bold text-xl mb-6 text-center flex items-center justify-center gap-2">
              <CreditCard size={22} /> Confirm & Pay
            </h2>

            {/* Summary recap */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Items ({displayItems.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>₹{displaySubtotal}</span>
              </div>
              {displayDiscount > 0 && !coupon?.freeShipping && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>−₹{displayDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Shipping</span>
                <span className={freeShipping ? 'text-green-600 font-bold' : ''}>
                  {freeShipping ? (
                    coupon?.freeShipping && calculatedShippingCharge ? (
                      <span className="flex items-center gap-1.5 justify-end">
                        <span className="text-gray-400 line-through font-normal text-xs">₹{calculatedShippingCharge}</span>
                        <span>FREE</span>
                      </span>
                    ) : 'FREE'
                  ) : `₹${shippingCharge || 0}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black border-t pt-3">
                <span>Amount to Pay</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <div className="text-sm text-text-muted mb-4 text-center">
              Delivering to: <span className="font-semibold text-text-main">{form.name}</span>, {form.city} - {form.pincode}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-4">{error}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-primary justify-center py-4 rounded-xl text-base disabled:opacity-60"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : `Pay ₹${finalTotal}`}
            </button>
            <p className="text-xs text-center text-text-muted mt-3">🔒 Secure payment powered by PhonePe</p>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
            >
              <ChevronLeft size={16} /> Back to Order Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
