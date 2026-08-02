'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { X, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import Image from '@/components/ui/AppImage';
import { sendOTP, verifyOTPAndSetPassword } from '@/lib/api';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser, authModalMode } = useAuthStore();

  // Sync local mode whenever the modal opens with a configured mode
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_request' | 'forgot_reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset + sync mode every time the modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode as any || 'signin');
      setError(null);
      setSuccess(null);
      setLoading(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setFullName('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => setAuthModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        const signupData = await response.json();
        if (!response.ok) throw new Error(signupData.error || 'Signup failed');

        // Automatically sign in the user after creation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        setSuccess('Account created and verified successfully!');
        if (signInData.user) setUser(signInData.user);
        setTimeout(() => handleClose(), 1200);
      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        setSuccess('Successfully signed in!');
        setTimeout(() => handleClose(), 1200);
      } else if (mode === 'forgot_request') {
        if (!email.trim()) throw new Error('Please enter your email address.');
        await sendOTP(email.trim());
        setSuccess('Verification code sent to your email! Please check your inbox.');
        setMode('forgot_reset');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'forgot_reset') {
        if (!otpCode.trim()) throw new Error('Please enter the verification code.');
        if (!password) throw new Error('Please enter a new password.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');

        await verifyOTPAndSetPassword(email.trim(), otpCode.trim(), password);
        setSuccess('Password updated successfully! You can now sign in with your new password.');
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setOtpCode('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot_request' || mode === 'forgot_reset';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white w-full max-w-[480px] rounded-[32px] overflow-hidden shadow-2xl relative animate-scale-in">

        {/* Decorative top band */}
        <div className="h-2 bg-gradient-to-r from-brand-green via-[#2d8a32] to-[#1D5E20]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F5F5] text-[#444] hover:bg-[#EEEEEE] hover:text-brand-black transition-all z-10"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="px-8 pb-8 pt-7 md:px-12 md:pb-10 md:pt-8">

          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-[140px] h-[38px] mb-5">
              <Image src="/image-2@2x.png" alt="Grainzz Logo" fill sizes="150px" className="object-contain" />
            </div>

            {/* Mode-specific badge */}
            {isSignup ? (
              <div className="flex items-center gap-1.5 bg-[#FFF8E1] text-[#B45309] text-[12px] font-bold px-3 py-1.5 rounded-full mb-4 border border-[#FDE68A]">
                <Sparkles size={13} />
                Join the Grainzz Family – It's Free!
              </div>
            ) : isForgot ? (
              <div className="flex items-center gap-1.5 bg-[#FFF8E1] text-[#B45309] text-[12px] font-bold px-3 py-1.5 rounded-full mb-4 border border-[#FDE68A]">
                <Sparkles size={13} />
                Password Recovery
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#F0FFF4] text-brand-green text-[12px] font-bold px-3 py-1.5 rounded-full mb-4 border border-[#BBF7D0]">
                <ShoppingBag size={13} />
                Sign in to continue shopping
              </div>
            )}

            <h2 className="text-[26px] font-black text-brand-black tracking-tight font-brand mb-2">
              {isSignup ? 'Create Your Account' : isForgot ? 'Reset Password' : 'Welcome Back!'}
            </h2>
            <p className="text-[#666] text-[14px] font-medium max-w-[300px] leading-relaxed">
              {isSignup
                ? 'Get exclusive deals, track orders & enjoy a healthier snacking life.'
                : mode === 'forgot_request'
                ? 'Enter your email below to receive a secure password recovery code.'
                : mode === 'forgot_reset'
                ? 'Enter the verification code sent to your email and set your new password.'
                : 'Sign in to access your cart, orders, and exclusive member deals.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-4 bg-[#FFF5F6] border border-[#FFD6D9] rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle size={18} className="text-brand-red shrink-0 mt-0.5" />
              <p className="text-brand-red text-[13px] font-semibold leading-tight">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-[#F2F9F2] border border-[#D9E8D9] rounded-2xl flex items-start gap-3 animate-fade-in">
              <CheckCircle2 size={18} className="text-brand-green shrink-0 mt-0.5" />
              <p className="text-brand-green text-[13px] font-semibold leading-tight">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {(mode === 'signin' || mode === 'signup') && (
              <>
                {isSignup && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                      <User size={19} strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Mail size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Lock size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                {!isSignup && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_request');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs text-brand-green font-semibold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[58px] bg-brand-green text-white rounded-full flex items-center justify-center gap-3 font-black text-[17px] hover:bg-[#154617] disabled:opacity-70 transition-all shadow-[0_4px_20px_rgba(29,94,32,0.25)] hover:shadow-[0_6px_28px_rgba(29,94,32,0.35)] hover:scale-[1.01] active:scale-[0.99] mt-5"
                >
                  {loading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isSignup ? 'Create My Account' : 'Sign In'}</span>
                      <ArrowRight size={22} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </>
            )}

            {mode === 'forgot_request' && (
              <>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Mail size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[58px] bg-brand-green text-white rounded-full flex items-center justify-center gap-3 font-black text-[17px] hover:bg-[#154617] disabled:opacity-70 transition-all shadow-[0_4px_20px_rgba(29,94,32,0.25)] hover:shadow-[0_6px_28px_rgba(29,94,32,0.35)] hover:scale-[1.01] active:scale-[0.99] mt-5"
                >
                  {loading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={22} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </>
            )}

            {mode === 'forgot_reset' && (
              <>
                <div className="relative group opacity-70">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB]">
                    <Mail size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#EEEEEE] text-[#666666] font-medium text-[15px] cursor-not-allowed"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Mail size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Verification Code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Lock size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BBBBBB] group-focus-within:text-brand-green transition-colors">
                    <Lock size={19} strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[54px] pl-[50px] pr-5 rounded-2xl border-2 border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[15px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[58px] bg-brand-green text-white rounded-full flex items-center justify-center gap-3 font-black text-[17px] hover:bg-[#154617] disabled:opacity-70 transition-all shadow-[0_4px_20px_rgba(29,94,32,0.25)] hover:shadow-[0_6px_28px_rgba(29,94,32,0.35)] hover:scale-[1.01] active:scale-[0.99] mt-5"
                >
                  {loading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={22} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Benefits strip (signup only) */}
          {isSignup && (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {['Exclusive Deals', 'Order Tracking', 'Early Access'].map((b) => (
                <div key={b} className="bg-[#F8FFF8] border border-[#D1FAE5] rounded-xl py-2 px-1">
                  <p className="text-[11px] font-bold text-brand-green leading-tight">✓ {b}</p>
                </div>
              ))}
            </div>
          )}

          {/* Toggle Mode */}
          <div className="mt-7 pt-6 border-t border-[#F5F5F5] text-center">
            {isForgot ? (
              <p className="text-[#666] text-[14px] font-medium">
                Remember your password?
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="ml-2 text-brand-green font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-[#666] text-[14px] font-medium">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignup ? 'signin' : 'signup');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="ml-2 text-brand-green font-bold hover:underline"
                >
                  {isSignup ? 'Sign In' : 'Sign Up Free'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

