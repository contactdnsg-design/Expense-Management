'use client';
import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Credential {
  role: string;
  email: string;
  password: string;
}

interface DemoCredentialsProps {
  credentials: Credential[];
  onSelect: (email: string, password: string) => void;
}

export default function DemoCredentials({ credentials, onSelect }: DemoCredentialsProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, fieldId: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(fieldId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Demo Accounts</span>
          <span className="text-xs text-slate-600">— click any role to autofill</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-800 divide-y divide-slate-800/60">
          {credentials.map((cred) => (
            <div key={`cred-${cred.role}`} className="px-4 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-cyan-400 font-mono">{cred.role}</span>
                <button
                  onClick={() => onSelect(cred.email, cred.password)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors px-2 py-0.5 rounded border border-slate-700 hover:border-cyan-500/40 font-medium"
                >
                  Use this account
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono truncate flex-1">{cred.email}</span>
                  <button
                    onClick={() => handleCopy(cred.email, `email-${cred.role}`)}
                    className="ml-2 text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                    aria-label={`Copy email for ${cred.role}`}
                  >
                    {copiedField === `email-${cred.role}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">{'•'.repeat(12)}</span>
                  <button
                    onClick={() => handleCopy(cred.password, `pass-${cred.role}`)}
                    className="ml-2 text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                    aria-label={`Copy password for ${cred.role}`}
                  >
                    {copiedField === `pass-${cred.role}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}