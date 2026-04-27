'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { X, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        setSuccess('Account created! Please check your email for verification.');
        // For some configs, it auto logs in. Let's handle both.
        if (data.user) setUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
        setSuccess('Successfully signed in!');
        setTimeout(() => {
           handleClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-[480px] rounded-[32px] overflow-hidden shadow-2xl relative animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#F5F5F5] text-[#222222] hover:bg-[#EEEEEE] transition-colors z-10"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="p-8 md:p-12">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative w-[140px] h-[40px] mb-6">
              <Image src="/image-2@2x.png" alt="Grainzz Logo" fill className="object-contain" />
            </div>
            <h2 className="text-[28px] font-bold text-brand-black tracking-tight font-brand mb-2">
              {mode === 'signin' ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
            <p className="text-[#666666] text-[15px] font-medium max-w-[280px]">
              {mode === 'signin' 
                ? 'Sign in to access your account, orders, and more.' 
                : 'Join the Grainzz family for a healthier snacking experience.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-4 bg-[#FFF5F6] border border-[#FFD6D9] rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle size={20} className="text-brand-red shrink-0 mt-0.5" />
              <p className="text-brand-red text-[14px] font-semibold leading-tight">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-[#F2F9F2] border border-[#D9E8D9] rounded-2xl flex items-start gap-3 animate-fade-in">
              <CheckCircle2 size={20} className="text-brand-green shrink-0 mt-0.5" />
              <p className="text-brand-green text-[14px] font-semibold leading-tight">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1A1] group-focus-within:text-brand-green transition-colors">
                  <User size={20} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-[56px] pl-[54px] pr-5 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[16px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1A1] group-focus-within:text-brand-green transition-colors">
                <Mail size={20} strokeWidth={2} />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[56px] pl-[54px] pr-5 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[16px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1A1] group-focus-within:text-brand-green transition-colors">
                <Lock size={20} strokeWidth={2} />
              </div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[56px] pl-[54px] pr-5 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] text-brand-black font-medium text-[16px] focus:bg-white focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[60px] bg-brand-green text-white rounded-full flex items-center justify-center gap-3 font-bold text-[18px] hover:bg-[#154617] disabled:opacity-70 transition-all shadow-[0_4px_16px_rgba(29,94,32,0.2)] mt-8"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 pt-8 border-t border-[#F5F5F5] text-center">
            <p className="text-[#666666] text-[15px] font-medium">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="ml-2 text-brand-green font-bold hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
