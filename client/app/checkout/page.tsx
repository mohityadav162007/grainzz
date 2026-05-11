'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Loader2, Check, MapPin, Package, CreditCard, Truck, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder, initiatePayment, getShippingRates, getSavedAddresses, getProductById, type SavedAddress } from '@/lib/api';

declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (config: any) => void;
    };
  }
}

const COMBO_CATEGORIES = ['Combos', 'Gift Packs', '2-Jar Combo', '3-Jar Combo', '4-Jar Combo', '6-Jar Combo', 'Puffed Rice Mixed 6-Pack'];

export default function CheckoutPage() {
  const { items, quickBuyItem, subtotal, discount, total, coupon, clearCart, setQuickBuy } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

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
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);

  // Product weights for shipping calculation
  const [itemWeights, setItemWeights] = useState<Record<string, number>>({});
  const [hasCombo, setHasCombo] = useState(false);

  const displayItems = quickBuyItem ? [quickBuyItem] : items;
  const displaySubtotal = quickBuyItem ? quickBuyItem.price * quickBuyItem.quantity : subtotal();
  const displayDiscount = quickBuyItem ? 0 : discount();
  const displayTotal = quickBuyItem ? displaySubtotal : total();
  const finalTotal = displayTotal + (shippingCharge || 0);

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

  // Fetch product weights for shipping calculation
  useEffect(() => {
    const fetchWeights = async () => {
      const weights: Record<string, number> = {};
      let comboDetected = false;
      for (const item of displayItems) {
        try {
          const product = await getProductById(item.id);
          if (product) {
            // Weight field is TEXT, try to parse number from it (e.g., "200g", "0.5 kg", "500")
            const weightStr = product.weight || '';
            let weightKg = 0.5; // default per item
            const match = weightStr.match(/([\d.]+)\s*(kg|g|gm|gram)?/i);
            if (match) {
              const val = parseFloat(match[1]);
              const unit = (match[2] || 'g').toLowerCase();
              weightKg = unit === 'kg' ? val : val / 1000;
            }
            weights[item.id] = weightKg;
            if (COMBO_CATEGORIES.includes(product.category)) {
              comboDetected = true;
            }
          }
        } catch { }
      }
      setItemWeights(weights);
      setHasCombo(comboDetected);
    };
    if (displayItems.length > 0) fetchWeights();
  }, [displayItems.length]);

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
    setShippingLoading(true);
    setError('');
    
    // Create a timeout promise to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Shipping calculation timed out. Please try again.')), 12000)
    );

    try {
      // Calculate total weight from product weights
      let totalWeight = 0;
      for (const item of displayItems) {
        const w = itemWeights[item.id] || 0.5;
        totalWeight += w * item.quantity;
      }
      // Minimum weight 0.5 kg
      totalWeight = Math.max(totalWeight, 0.5);

      const ratesPromise = getShippingRates({
        delivery_pincode: form.pincode,
        weight: totalWeight,
        subtotal: displaySubtotal,
        has_combo: hasCombo,
      });

      // Race the API call against the timeout
      const rates = await Promise.race([ratesPromise, timeoutPromise]) as any;

      if (rates.fallback && rates.error) {
        console.warn('Using fallback shipping rates due to API error:', rates.error);
        // We still proceed, but maybe log it
      }

      setShippingCharge(rates.shipping_charge || 0);
      setEstimatedDelivery(rates.estimated_delivery || '');
      setFreeShipping(rates.free_shipping || false);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Shipping calculation error:', err);
      setError(err.message || 'Failed to calculate shipping. Please try again.');
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (displayItems.length === 0) return;
    setLoading(true);
    setError('');
    try {
      let orderId = pendingOrderId;

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
          couponCode: quickBuyItem ? '' : (coupon?.code || ''),
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

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10">
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
              <div className={`w-8 md:w-16 h-[2px] mx-1 ${
                currentStep > step.num ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: ADDRESS ─────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="grid md:grid-cols-3 gap-8">
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

            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
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
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold mb-4">Your Cart</h2>
              {quickBuyItem && <div className="text-xs bg-brand-light/50 text-brand-dark px-3 py-1.5 rounded-md mb-3 font-medium">Quick Buy Checkout</div>}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-3">
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
                  <span>₹{displaySubtotal}</span>
                </div>
                {displayDiscount > 0 && (
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
                  <span>Subtotal</span>
                  <span>₹{displayTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: ORDER SUMMARY ──────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {/* Shipping Address Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2"><MapPin size={18} /> Shipping Address</h2>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-primary font-bold hover:underline">Edit</button>
              </div>
              <div className="text-sm text-text-muted leading-relaxed">
                <p className="font-semibold text-text-main">{form.name}</p>
                <p>{form.address}</p>
                <p>{form.city}, {form.state} - {form.pincode}</p>
                <p>Phone: {form.phone}</p>
                {form.email && <p>Email: {form.email}</p>}
              </div>
            </div>

            {/* Ordered Products */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Package size={18} /> Order Items</h2>
              <div className="space-y-4">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
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
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-800">Estimated Delivery</p>
                  <p className="text-xs text-green-600">{estimatedDelivery}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-text-muted hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 btn-primary justify-center py-4 rounded-xl text-base"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>

          {/* Right – Price Summary */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold mb-4">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>₹{displaySubtotal}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon?.code})</span>
                    <span>−₹{displayDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted flex items-center gap-1"><Truck size={14} /> Shipping</span>
                  <span className={freeShipping ? 'text-green-600 font-bold' : ''}>
                    {freeShipping ? 'FREE' : `₹${shippingCharge || 0}`}
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
              {displayDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>−₹{displayDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Shipping</span>
                <span className={freeShipping ? 'text-green-600 font-bold' : ''}>
                  {freeShipping ? 'FREE' : `₹${shippingCharge || 0}`}
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
