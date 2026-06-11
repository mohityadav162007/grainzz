'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Mounts invisibly in the root layout.
 * After 10 seconds, if the user is NOT signed in, it opens the AuthModal in sign-up mode.
 * Uses sessionStorage so the popup only fires once per browser session.
 */
export default function GuestPopupTrigger() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);
  const setGuestPopupMode = useAuthStore((s) => s.setGuestPopupMode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    // Don't schedule until auth is resolved
    if (loading) return;
    // Already signed in
    if (user) return;
    // Already fired this session
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('gz_guest_popup')) return;
    } catch {
      // Safari private browsing may throw — treat as no prior popup
    }
    // Already scheduled
    if (firedRef.current) return;

    firedRef.current = true;

    timerRef.current = setTimeout(() => {
      // Final check inside timeout
      const state = useAuthStore.getState();
      if (!state.user && !state.isAuthModalOpen) {
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('gz_guest_popup', '1');
          }
        } catch {
          // Safari private browsing — silently fail
        }
        state.setGuestPopupMode('signup');
        state.setAuthModalOpen(true);
      }
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  return null;
}
