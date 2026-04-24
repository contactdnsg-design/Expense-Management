'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface MFAModalProps {
  email: string;
  onClose: () => void;
}

export default function MFAModal({ email, onClose }: MFAModalProps) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Enter all 6 digits to continue');
      return;
    }
    setLoading(true);
    // Backend integration point: Supabase MFA verifyTOTP or verify SMS OTP
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);

    // Demo: any 6-digit code works
    toast.success('Authentication successful — welcome to ClaimFlow');
    router.push('/expense-claims-dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card-elevated rounded-2xl p-8 w-full max-w-sm animate-float-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded" aria-label="Close MFA modal">
          <X size={18} />
        </button>

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto mb-5">
          <Shield size={26} className="text-cyan-400" />
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-1">Two-Factor Authentication</h3>
        <p className="text-sm text-slate-400 text-center mb-1">
          Enter the 6-digit code from your authenticator app
        </p>
        <p className="text-xs text-slate-600 text-center font-mono mb-6">{email}</p>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-4">
          {code.map((digit, i) => (
            <input
              key={`otp-digit-${i}`}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-lg border transition-all duration-150 outline-none bg-slate-900/60
                ${digit ? 'border-cyan-500/60 text-cyan-300' : 'border-slate-700/60 text-slate-100'}
                focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)]
                ${error ? 'border-red-500/60' : ''}
              `}
              aria-label={`MFA digit ${i + 1}`}
            />
          ))}
        </div>

        {error && <p className="text-xs text-red-400 text-center mb-3">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
          style={{ minHeight: '42px' }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <>Verify & Sign In <ArrowRight size={16} /></>}
        </button>

        <p className="text-xs text-slate-600 text-center mt-4">
          Lost access to your authenticator?{' '}
          <span className="text-cyan-500/70 hover:text-cyan-400 cursor-pointer transition-colors">Use backup code</span>
        </p>
      </div>
    </div>
  );
}