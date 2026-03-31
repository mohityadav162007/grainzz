'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Payment Successful! 🎉</h1>
      <p className="text-text-muted mb-2">Thank you for choosing Grainzz. Your order has been placed.</p>
      {orderId && (
        <p className="text-sm text-text-muted mb-6 font-mono bg-gray-50 px-4 py-2 rounded-lg">
          Order ID: <span className="font-bold text-primary">{orderId}</span>
        </p>
      )}
      <p className="text-sm text-text-muted mb-8 max-w-sm">
        We'll send you a confirmation and shipping details soon. Happy snacking! 🌾
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/products" className="btn-primary"><Package size={16} /> Continue Shopping</Link>
        <Link href="/" className="btn-outline">Back to Home</Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><CheckCircle size={40} className="text-green-400 animate-pulse" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
