import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Safari-safe storage getter
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

interface WishlistStore {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) => set((state) => ({ 
        items: state.items.includes(id) ? state.items : [...state.items, id] 
      })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((item) => item !== id) 
      })),
      hasItem: (id) => get().items.includes(id),
    }),
    {
      name: 'grainzz-wishlist-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? getSafeStorage() : (undefined as any)
      ),
    }
  )
);
