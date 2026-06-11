import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Safari-safe storage getter: returns a localStorage-compatible object
// that guards against unavailability (Safari private browsing, SSR, quota exceeded)
const getSafeStorage = (): Storage => ({
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string): void => {
    try { localStorage.setItem(name, value); } catch { /* quota exceeded */ }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* ignore */ }
  },
  get length() { try { return localStorage.length; } catch { return 0; } },
  clear: () => { try { localStorage.clear(); } catch { /* ignore */ } },
  key: (index: number) => { try { return localStorage.key(index); } catch { return null; } },
});

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  tags?: string[];
}

export interface CouponData {
  code: string;
  discountType: string;
  value: number;
  discountAmount: number;
  minOrderValue: number;
  maxDiscount: number | null;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  freeShipping?: boolean;
}

interface CartStore {
  items: CartItem[];
  quickBuyItem: CartItem | null;
  coupon: CouponData | null;
  isOpen: boolean;
  couponNotification: string | null;
  setCouponNotification: (msg: string | null) => void;
  addItem: (item: CartItem) => void;
  setQuickBuy: (item: CartItem | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponData) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  itemCount: () => number;
  revalidateCouponState: (showNotification?: boolean) => void;
  revalidateCouponStateAsync: (showNotification?: boolean, userId?: string, email?: string) => Promise<void>;
}

export const validateCoupon = (coupon: CouponData | null, subtotal: number): { isValid: boolean; reason?: string } => {
  if (!coupon) return { isValid: false, reason: 'No coupon applied' };
  if (!coupon.isActive) return { isValid: false, reason: 'Coupon is no longer active' };
  if (new Date(coupon.expiryDate) < new Date()) return { isValid: false, reason: 'Coupon has expired' };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { isValid: false, reason: 'Coupon usage limit reached' };
  if (subtotal < coupon.minOrderValue) return { isValid: false, reason: `Minimum order value of ₹${coupon.minOrderValue} is no longer met` };
  return { isValid: true };
};

export const calculateDiscount = (coupon: CouponData | null, subtotal: number): number => {
  if (!coupon) return 0;
  // Free shipping coupons provide no monetary discount
  if (coupon.freeShipping) return 0;
  const validation = validateCoupon(coupon, subtotal);
  if (!validation.isValid) return 0;

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount !== null && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }
  return Math.round(Math.min(discount, subtotal));
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      quickBuyItem: null,
      coupon: null,
      isOpen: false,
      couponNotification: null,

      setCouponNotification: (msg) => set({ couponNotification: msg }),

      revalidateCouponStateAsync: async (showNotification = false, userId?: string, email?: string) => {
        const { coupon, items, subtotal, quickBuyItem } = get();
        const activeItems = quickBuyItem ? [quickBuyItem] : items;
        // Rule: Clear coupon if cart is empty
        if (activeItems.length === 0) {
          if (coupon) {
            set({ coupon: null });
          }
          return;
        }

        if (!coupon) return;

        const currentSubtotal = quickBuyItem ? (quickBuyItem.price * quickBuyItem.quantity) : subtotal();
        const validation = validateCoupon(coupon, currentSubtotal);

        if (!validation.isValid) {
          set({ coupon: null });
          if (showNotification) {
            set({ couponNotification: validation.reason || 'Coupon removed because threshold is no longer met.' });
          }
          return;
        }

        // If userId or email is available, query history API for first-order coupons or prior usage
        if (userId || email) {
          try {
            const cleanEmail = email?.trim().toLowerCase() || '';
            const verifyRes = await fetch(`/api/coupons/verify?code=${encodeURIComponent(coupon.code)}&email=${encodeURIComponent(cleanEmail)}&userId=${encodeURIComponent(userId || '')}`);
            const verifyData = await verifyRes.json();
            if (verifyData.used) {
              set({ coupon: null });
              if (showNotification) {
                set({ couponNotification: verifyData.error || 'Coupon removed because it is only valid for your first order.' });
              }
              return;
            }
          } catch (err) {
            console.error('Failed to verify coupon history in store:', err);
          }
        }

        // Dynamic discount amount update based on new subtotal
        const newDiscount = calculateDiscount(coupon, currentSubtotal);
        if (newDiscount !== coupon.discountAmount) {
          set({
            coupon: {
              ...coupon,
              discountAmount: newDiscount
            }
          });
        }
      },

      revalidateCouponState: (showNotification = false) => {
        const { coupon, items, subtotal, quickBuyItem } = get();
        
        const activeItems = quickBuyItem ? [quickBuyItem] : items;
        // Rule: Clear coupon if cart is empty
        if (activeItems.length === 0) {
          if (coupon) {
            set({ coupon: null });
          }
          return;
        }

        if (!coupon) return;

        const currentSubtotal = quickBuyItem ? (quickBuyItem.price * quickBuyItem.quantity) : subtotal();
        const validation = validateCoupon(coupon, currentSubtotal);

        if (!validation.isValid) {
          set({ coupon: null });
          if (showNotification) {
            set({ couponNotification: validation.reason || 'Coupon removed because threshold is no longer met.' });
          }
        } else {
          // Dynamic discount amount update based on new subtotal
          const newDiscount = calculateDiscount(coupon, currentSubtotal);
          if (newDiscount !== coupon.discountAmount) {
            set({
              coupon: {
                ...coupon,
                discountAmount: newDiscount
              }
            });
          }
        }
      },

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.id === newItem.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + (newItem.quantity || 1) } : i
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: newItem.quantity || 1 }] });
        }
        get().revalidateCouponState(true);
      },

      setQuickBuy: (item) => set({ quickBuyItem: item }),

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        get().revalidateCouponState(true);
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
        get().revalidateCouponState(true);
      },

      clearCart: () => set({ items: [], coupon: null, couponNotification: null }),

      applyCoupon: (coupon) => set({ coupon, couponNotification: null }),
      removeCoupon: () => set({ coupon: null, couponNotification: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      discount: () => get().coupon?.discountAmount || 0,
      total: () => {
        const sub = get().subtotal();
        const disc = get().discount();
        return Math.max(sub - disc, 0);
      },
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'grainzz-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? getSafeStorage() : (undefined as any)
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.revalidateCouponState(false);
        }
      }
    }
  )
);
