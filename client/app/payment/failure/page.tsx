import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle size={40} className="text-accent" />
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Payment Failed</h1>
      <p className="text-text-muted mb-8 max-w-sm">
        Something went wrong with your payment. Your cart is still saved. Please try again.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/checkout" className="btn-primary">Try Again</Link>
        <Link href="/contact" className="btn-outline">Contact Support</Link>
      </div>
    </div>
  );
}
