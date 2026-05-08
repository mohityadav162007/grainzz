'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { checkPaymentStatus } from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setErrorMsg('No order ID found in URL.');
      return;
    }

    let timeoutIds: NodeJS.Timeout[] = [];

    const verify = async () => {
      try {
        const res = await checkPaymentStatus(orderId);
        const state = res?.data?.state;

        if (state === 'COMPLETED') {
          setStatus('success');
          timeoutIds.push(setTimeout(() => {
            router.replace(`/payment/success?orderId=${orderId}`);
          }, 1500));
        } else if (state === 'FAILED') {
          setStatus('failed');
          timeoutIds.push(setTimeout(() => {
            router.replace('/payment/failure');
          }, 2000));
        } else {
          // PENDING or unknown — could still be processing
          // Retry once after 3 seconds
          timeoutIds.push(setTimeout(async () => {
            try {
              const retryRes = await checkPaymentStatus(orderId);
              const retryState = retryRes?.data?.state;
              if (retryState === 'COMPLETED') {
                setStatus('success');
                timeoutIds.push(setTimeout(() => router.replace(`/payment/success?orderId=${orderId}`), 1000));
              } else if (retryState === 'FAILED') {
                setStatus('failed');
                timeoutIds.push(setTimeout(() => router.replace('/payment/failure'), 1500));
              } else {
                // Still pending — show as pending, let user manually check
                setStatus('error');
                setErrorMsg('Payment is still being processed. Please check back shortly.');
              }
            } catch {
              setStatus('error');
              setErrorMsg('Unable to verify payment status. Please contact support.');
            }
          }, 3000));
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to verify payment.');
      }
    };

    verify();

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [orderId, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      {status === 'checking' && (
        <>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Loader2 size={40} className="text-blue-500 animate-spin" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Verifying Payment...</h1>
          <p className="text-text-muted mb-2">Please wait while we confirm your payment with PhonePe.</p>
          <p className="text-sm text-text-muted">Do not close this page.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Payment Confirmed! 🎉</h1>
          <p className="text-text-muted">Redirecting you to your order confirmation...</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Payment Failed</h1>
          <p className="text-text-muted">Redirecting you back...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
            <XCircle size={40} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main mb-3">Verification Issue</h1>
          <p className="text-text-muted mb-6 max-w-sm">{errorMsg}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={`/payment/verify?orderId=${orderId}`} className="btn-primary">Retry Verification</a>
            <a href="/contact" className="btn-outline">Contact Support</a>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={40} className="text-blue-400 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
