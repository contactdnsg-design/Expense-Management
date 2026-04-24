'use client';
import React from 'react';
import {
  IndianRupee, Clock, AlertTriangle, Timer,
  TrendingUp, TrendingDown, XCircle, CheckCircle2
} from 'lucide-react';

// Grid plan: 6 cards → grid-cols-4 → row 1: hero spans 2 cols + 2 regular, row 2: 3 regular (last spans 2 to fill)
// Actually: hero(2) + 2 regular = 4 cols row1; row2: 3 cards → first spans 2, 2 regular → 4 cols
const metrics = [
  {
    id: 'metric-pending-amount',
    label: 'Pending Reimbursement',
    value: '₹2,84,750',
    sub: '14 claims awaiting payment',
    trend: '+₹38,200 this week',
    trendDir: 'up' as const,
    icon: <IndianRupee size={20} />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/8 border-cyan-500/20',
    glowColor: 'rgba(6,182,212,0.12)',
    hero: true,
  },
  {
    id: 'metric-under-approval',
    label: 'Under Approval',
    value: '11',
    sub: 'Avg. 4.2 days in queue',
    trend: '+3 since yesterday',
    trendDir: 'up' as const,
    icon: <Clock size={18} />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/8 border-amber-500/20',
    glowColor: 'rgba(245,158,11,0.1)',
    hero: false,
  },
  {
    id: 'metric-policy-violations',
    label: 'Policy Violations',
    value: '2',
    sub: 'Exceeding approved limits',
    trend: '↑ from 0 last week',
    trendDir: 'down' as const,
    icon: <AlertTriangle size={18} />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    glowColor: 'rgba(239,68,68,0.12)',
    hero: false,
    alert: true,
  },
  {
    id: 'metric-avg-processing',
    label: 'Avg. Processing Time',
    value: '6.8d',
    sub: 'Submission → Reimbursement',
    trend: '−0.9d vs last month',
    trendDir: 'up' as const,
    icon: <Timer size={18} />,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/8 border-violet-500/20',
    glowColor: 'rgba(139,92,246,0.1)',
    hero: false,
  },
  {
    id: 'metric-mtd-reimbursed',
    label: 'Reimbursed (Apr 2026)',
    value: '₹6,12,400',
    sub: '38 claims settled MTD',
    trend: '+22% vs Mar 2026',
    trendDir: 'up' as const,
    icon: <CheckCircle2 size={18} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/8 border-emerald-500/20',
    glowColor: 'rgba(16,185,129,0.1)',
    hero: false,
  },
  {
    id: 'metric-rejection-rate',
    label: 'Rejection Rate',
    value: '8.3%',
    sub: '5 of 60 claims this month',
    trend: '+2.1% vs Mar 2026',
    trendDir: 'down' as const,
    icon: <XCircle size={18} />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/8 border-orange-500/20',
    glowColor: 'rgba(249,115,22,0.1)',
    hero: false,
  },
];

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero card — spans 2 cols */}
      {(() => {
        const m = metrics[0];
        return (
          <div
            key={m.id}
            className={`col-span-1 sm:col-span-2 lg:col-span-2 rounded-2xl border p-5 relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${m.bgColor}`}
            style={{ boxShadow: `0 4px 24px ${m.glowColor}, 0 1px 0 rgba(255,255,255,0.04) inset` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: m.glowColor }} />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color} bg-white/5`}>
                {m.icon}
              </div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{m.label}</span>
            </div>
            <div className="metric-value text-4xl text-white mb-1">{m.value}</div>
            <p className="text-sm text-slate-400 mb-3">{m.sub}</p>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${m.trendDir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {m.trendDir === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {m.trend}
            </div>
          </div>
        );
      })()}

      {/* Regular cards */}
      {metrics.slice(1, 4).map(m => (
        <div
          key={m.id}
          className={`rounded-2xl border p-5 relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${m.bgColor} ${m.alert ? 'animate-pulse-slow' : ''}`}
          style={{ boxShadow: `0 4px 16px ${m.glowColor}, 0 1px 0 rgba(255,255,255,0.04) inset` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color} bg-white/5`}>
              {m.icon}
            </div>
            {m.alert && (
              <span className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">ALERT</span>
            )}
          </div>
          <div className="metric-value text-2xl text-white mb-0.5">{m.value}</div>
          <p className="text-xs text-slate-400 mb-2 leading-snug">{m.sub}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${m.trendDir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {m.trendDir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{m.trend}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 tracking-wide uppercase font-medium">{m.label}</p>
        </div>
      ))}

      {/* Row 2: last 2 regular cards — first spans 2, second spans 2 */}
      {metrics.slice(4).map((m, i) => (
        <div
          key={m.id}
          className={`col-span-1 sm:col-span-1 lg:col-span-2 rounded-2xl border p-5 relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${m.bgColor}`}
          style={{ boxShadow: `0 4px 16px ${m.glowColor}, 0 1px 0 rgba(255,255,255,0.04) inset` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color} bg-white/5`}>
              {m.icon}
            </div>
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{m.label}</span>
          </div>
          <div className="metric-value text-3xl text-white mb-0.5">{m.value}</div>
          <p className="text-xs text-slate-400 mb-2">{m.sub}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${m.trendDir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {m.trendDir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{m.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}