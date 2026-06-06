'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';

export default function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const revalidateCouponStateAsync = useCartStore((state) => state.revalidateCouponStateAsync);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for auth state changes and re-validate any applied coupon.
  // This catches: guest → login, session restore on page load, and signup.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        // Run async validation with user identity so first-order coupons can be checked
        revalidateCouponStateAsync(true, user.id, user.email || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [revalidateCouponStateAsync]);

  return null;
}
