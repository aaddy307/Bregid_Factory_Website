'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Factory, Loader2 } from 'lucide-react';
import { login } from '@/services/auth';

export default function LoginPage() {
  const router = useRouter();
  // Store updated via login() service call
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await login({ email, password });

      // Check if worker — deny access
      if (user.role === 'worker') {
        setError('Worker panel is not available on web. Please use the mobile app.');
        setIsLoading(false);
        return;
      }

      // Check if inactive
      if (!user.isActive) {
        setError('Account is inactive. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const redirectPath = user.role === 'owner' ? '/owner/dashboard' : '/manager/dashboard';
      router.push(redirectPath);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as Error)?.message || 'Invalid email or password';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" style={{
      backgroundImage: 'radial-gradient(circle, #d5c3b7 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }}>
      {/* Decorative Corner Brackets */}
      <div className="fixed top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-leather-tan/30" />
      <div className="fixed top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-leather-tan/30" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-leather-tan/30" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-leather-tan/30" />

      <div className="w-full max-w-md px-4">
        <div className="card p-8 lg:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <Factory size={32} className="text-leather-tan" />
            </div>
            <h1 className="text-2xl font-bold text-primary">BREGID FACTORY</h1>
            <p className="text-sm text-on-surface-variant mt-1">Manufacturing Execution System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label-caps text-on-surface-variant block mb-1.5">Operator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="label-caps text-on-surface-variant block mb-1.5">Access Key</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-error bg-error/5 px-4 py-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-xs text-center text-on-surface-variant mt-6">
            Bregid Factory MES v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
