import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

export default function ComplianceBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <Shield size={13} />
        <span className="font-semibold">PHI Protected</span>
      </div>
      <span className="text-slate-700">·</span>
      <div className="flex items-center gap-1.5 text-cyan-400">
        <Lock size={13} />
        <span>End-to-end encrypted</span>
      </div>
      <span className="text-slate-700">·</span>
      <span className="text-slate-500">Tenant: <span className="font-mono text-slate-400">tenant_7f3a9c</span></span>
      <span className="text-slate-700">·</span>
      <span className="text-slate-500">RLS: <span className="text-emerald-400 font-medium">Active</span></span>
      <div className="ml-auto flex items-center gap-1.5 text-amber-400">
        <AlertTriangle size={12} />
        <span>2 policy violations need review</span>
      </div>
    </div>
  );
}