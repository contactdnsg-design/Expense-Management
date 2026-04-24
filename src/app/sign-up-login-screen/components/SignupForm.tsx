'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Loader2, Building2, CheckCircle, AlertTriangle } from 'lucide-react';

interface SignupFormData {
  tenantName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { id: 'len', label: 'At least 12 characters', pass: password.length >= 12 },
    { id: 'upper', label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { id: 'lower', label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { id: 'num', label: 'Number', pass: /\d/.test(password) },
    { id: 'special', label: 'Special character', pass: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const label = score <= 1 ? 'Very Weak' : score === 2 ? 'Weak' : score === 3 ? 'Fair' : score === 4 ? 'Strong' : 'Very Strong';
  const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-amber-500' : score === 4 ? 'bg-cyan-500' : 'bg-emerald-500';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-1 mr-3">
          {checks.map((_, i) => (
            <div key={`strength-bar-${i}`} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <div key={c.id} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${c.pass ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            <span className={`text-xs ${c.pass ? 'text-emerald-400' : 'text-slate-600'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hibpChecking, setHibpChecking] = useState(false);
  const [hibpBreached, setHibpBreached] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();
  const password = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setHibpChecking(true);

    // Backend integration point: HIBP API check + Supabase Auth signUp + tenant creation
    await new Promise(r => setTimeout(r, 800));
    setHibpChecking(false);

    // Simulate HIBP check pass
    setHibpBreached(false);

    // Backend integration point: Create tenant row, assign Owner role, initialize RLS policies
    await new Promise(r => setTimeout(r, 800));

    setLoading(false);
    setSuccess(true);
    toast.success(`Workspace "${data.tenantName}" created successfully!`);
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-float-up">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Workspace created!</h2>
        <p className="text-slate-400 text-sm">Your ClaimFlow tenant is ready. Check your email to verify and set up MFA.</p>
        <button onClick={onSwitchToLogin} className="btn-primary mx-auto mt-4">
          Sign In to your workspace <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-float-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Create your workspace</h2>
        <p className="text-slate-400 text-sm">Self-serve tenant onboarding — you&apos;ll be the Owner</p>
      </div>

      {hibpBreached && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-700/40 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">This password has appeared in known data breaches. Please choose a different password.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Tenant name */}
        <div>
          <label htmlFor="tenant-name" className="block text-sm font-medium text-slate-300 mb-1.5">
            Organization Name
          </label>
          <p className="text-xs text-slate-500 mb-1.5">This creates your isolated multi-tenant workspace</p>
          <div className="relative">
            <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="tenant-name"
              type="text"
              className={`input-field pl-9 ${errors.tenantName ? 'border-red-500/60' : ''}`}
              placeholder="Acme Corp"
              {...register('tenantName', { required: 'Organization name is required', minLength: { value: 2, message: 'Must be at least 2 characters' } })}
            />
          </div>
          {errors.tenantName && <p className="mt-1.5 text-xs text-red-400">{errors.tenantName.message}</p>}
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            className={`input-field ${errors.fullName ? 'border-red-500/60' : ''}`}
            placeholder="Sunny Singh"
            {...register('fullName', { required: 'Full name is required' })}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-500/60' : ''}`}
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <p className="text-xs text-slate-500 mb-1.5">Checked against HaveIBeenPwned database on submission</p>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pr-10 ${errors.password ? 'border-red-500/60' : ''}`}
              placeholder="Min. 12 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 12, message: 'Password must be at least 12 characters' },
                pattern: { value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/, message: 'Must include uppercase, lowercase, number, and special character' },
              })}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500/60' : ''}`}
              placeholder="Re-enter password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === password || 'Passwords do not match',
              })}
            />
            <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" aria-label="Toggle confirm password visibility">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <input
            id="agree-terms"
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0 flex-shrink-0"
            {...register('agreeToTerms', { required: 'You must agree to the terms' })}
          />
          <label htmlFor="agree-terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
            I agree to the{' '}
            <span className="text-cyan-400 hover:underline cursor-pointer">Terms of Service</span>,{' '}
            <span className="text-cyan-400 hover:underline cursor-pointer">Privacy Policy</span>, and
            acknowledge that all claim data is treated as PHI under HIPAA.
          </label>
        </div>
        {errors.agreeToTerms && <p className="text-xs text-red-400">{errors.agreeToTerms.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{ minHeight: '42px' }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />{hibpChecking ? 'Checking password security…' : 'Creating workspace…'}</>
          ) : (
            <>Create Workspace <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have a workspace?{' '}
        <button onClick={onSwitchToLogin} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
          Sign In
        </button>
      </p>
    </div>
  );
}