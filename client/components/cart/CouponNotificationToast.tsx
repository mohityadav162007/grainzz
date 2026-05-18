'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CouponNotificationToast() {
  const { couponNotification, setCouponNotification } = useCartStore();

  useEffect(() => {
    if (couponNotification) {
      const timer = setTimeout(() => {
        setCouponNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [couponNotification, setCouponNotification]);

  return (
    <AnimatePresence>
      {couponNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[400px]"
        >
          <div className="flex items-start gap-3 bg-[#FCF5F5] border-2 border-[#D72638] rounded-2xl p-4 shadow-[0_8px_30px_rgba(215,38,56,0.15)] backdrop-blur-md">
            <AlertCircle className="text-[#D72638] shrink-0 mt-0.5" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-[#D72638] m-0">Coupon Notice</p>
              <p className="text-[13px] font-bold text-[#666666] m-0 mt-0.5 leading-relaxed">
                {couponNotification}
              </p>
            </div>
            <button
              onClick={() => setCouponNotification(null)}
              className="text-[#999999] hover:text-brand-black transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
