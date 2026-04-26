import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  tags?: string[];
}

interface CouponData {
  code: string;
  discountType: string;
  value: number;
  discountAmount: number;
}

interface CartStore {
  items: CartItem[];
  coupon: CouponData | null;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,

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
        set({ isOpen: true });
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

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
    { name: 'grainzz-cart' }
  )
);
