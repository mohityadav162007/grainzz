'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { adminLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(email, password);
      localStorage.setItem('grainzz_admin_token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            GRAIN<span className="text-red-600">ZZ</span> Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your admin dashboard</p>
        </div>

        <div className="admin-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@grainzz.com"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}
            <button id="admin-login-btn" type="submit" disabled={loading} className="admin-btn w-full justify-center py-3 text-base">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing In...</> : 'Sign In'}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            Default: admin@grainzz.com / Grainzz@2026
          </p>
        </div>
      </div>
    </div>
  );
}
