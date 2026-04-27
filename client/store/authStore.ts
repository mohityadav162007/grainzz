import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  isAuthModalOpen: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user || null }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    set({ loading: true });
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user || null, loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null, loading: false });
    });
  },
}));
