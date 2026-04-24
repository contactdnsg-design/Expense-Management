'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import DemoCredentials from './DemoCredentials';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onMFARequired: (email: string) => void;
}

// Mock credentials — backend: replace with Supabase Auth signInWithPassword
const DEMO_CREDENTIALS = [
  { role: 'Owner', email: 'owner@dnsgventures.in', password: 'ClaimFlow@2026' },
  { role: 'Admin', email: 'admin@dnsgventures.in', password: 'ClaimFlow@2026' },
  { role: 'Member', email: 'sunny.singh@dnsgventures.in', password: 'ClaimFlow@2026' },
  { role: 'Auditor', email: 'auditor@dnsgventures.in', password: 'ClaimFlow@2026' },
  { role: 'Compliance Officer', email: 'compliance@dnsgventures.in', password: 'ClaimFlow@2026' },
];

export default function LoginForm({ onSwitchToSignup, onMFARequired }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [hibpWarning, setHibpWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setHibpWarning(false);

    // Backend integration point: Supabase Auth signInWithPassword
    await new Promise(resolve => setTimeout(resolve, 1200));

    const validCredential = DEMO_CREDENTIALS.find(
      c => c.email === data.email && c.password === data.password
    );

    if (!validCredential) {
      setLoading(false);
      toast.error('Invalid credentials — use the demo accounts below to sign in');
      return;
    }

    // Simulate HIBP check for weak passwords
    if (data.password === 'password123') {
      setHibpWarning(true);
      setLoading(false);
      return;
    }

    setLoading(false);

    // 2FA DISABLED — re-enable by uncommenting the line below and removing the router.push line
    // onMFARequired(data.email);
    toast.success('Sign in successful — welcome to ClaimFlow');
    router.push('/expense-claims-dashboard');
  };

  const handleSSOLogin = (provider: 'google' | 'apple') => {
    // Backend integration point: Supabase Auth signInWithOAuth
    toast.info(`Redirecting to ${provider === 'google' ? 'Google' : 'Apple'} SSO…`);
  };

  return (
    <div className="animate-float-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm">Sign in to your ClaimFlow workspace</p>
      </div>

      {/* HIBP Warning */}
      {hibpWarning && (
        <div className="mb-5 p-3 rounded-lg bg-red-950/50 border border-red-700/40 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Password breach detected</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              This password has appeared in known data breaches (HIBP). Please reset your password before continuing.
            </p>
          </div>
        </div>
      )}

      {/* SSO Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleSSOLogin('google')}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-150 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          onClick={() => handleSSOLogin('apple')}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-all duration-150 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600 font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
            Work Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
            placeholder="you@company.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input-field pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
              placeholder="••••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-slate-400 cursor-pointer">
            Keep me signed in for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{ minHeight: '42px' }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Verifying credentials…</>
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      {/* Switch to signup */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have a workspace?{' '}
        <button onClick={onSwitchToSignup} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
          Create tenant account
        </button>
      </p>

      {/* Demo credentials */}
      <div className="mt-6">
        <DemoCredentials credentials={DEMO_CREDENTIALS} onSelect={(email, password) => {
          setValue('email', email);
          setValue('password', password);
        }} />
      </div>
    </div>
  );
}