import React from 'react';
import { Shield, Lock, FileCheck, Globe, Award, Zap } from 'lucide-react';

const complianceBadges = [
  { id: 'badge-hipaa', label: 'HIPAA', desc: 'PHI Protected', icon: <Shield size={16} />, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'badge-gdpr', label: 'GDPR', desc: 'EU Compliant', icon: <Globe size={16} />, color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  { id: 'badge-soc2', label: 'SOC 2', desc: 'Type II Ready', icon: <Award size={16} />, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'badge-iso', label: 'ISO 27001', desc: 'Certified', icon: <Lock size={16} />, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

const features = [
  { id: 'feat-claims', icon: <FileCheck size={18} />, title: 'Multi-step claim workflows', desc: 'Pre-claim, post-claim, and exception flows' },
  { id: 'feat-approval', icon: <Zap size={18} />, title: 'Automated approval routing', desc: 'Policy-aware hierarchy with real-time tracking' },
  { id: 'feat-audit', icon: <Shield size={18} />, title: 'Immutable audit trails', desc: 'Every action logged with timestamp and actor' },
];

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[520px] xl:w-[600px] flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-navy-900 border-r border-slate-800/60">
      {/* Animated background */}
      <div className="absolute inset-0 grid-scan-line opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 24px rgba(6,182,212,0.4)' }}>
            <FileCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ClaimFlow</h1>
            <p className="text-xs text-cyan-500/80 font-mono">Enterprise Edition</p>
          </div>
        </div>
      </div>
      {/* Hero text */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Compliance-grade<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
              expense management
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Multi-tenant reimbursement platform built for regulated industries.
            PHI-safe, audit-ready, and ERP-integrated.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {features?.map(f => (
            <div key={f?.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                {f?.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{f?.title}</p>
                <p className="text-xs text-slate-500">{f?.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance badges */}
        <div>
          <p className="text-xs text-slate-600 font-semibold tracking-widest uppercase mb-3">Compliance Standards</p>
          <div className="grid grid-cols-2 gap-2">
            {complianceBadges?.map(b => (
              <div key={b?.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${b?.color}`}>
                <span className="flex-shrink-0">{b?.icon}</span>
                <div>
                  <p className="text-xs font-bold">{b?.label}</p>
                  <p className="text-xs opacity-70">{b?.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="relative z-10">
        <p className="text-xs text-slate-600">
          Self-hosted · End-to-end encrypted · Multi-tenant RLS
        </p>
      </div>
    </div>
  );
}