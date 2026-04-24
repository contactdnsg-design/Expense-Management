'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Backend integration point: fetch from /api/claims/volume?range=30d&tenant_id=...
const data = [
  { date: '25 Mar', submitted: 4, approved: 2, rejected: 0 },
  { date: '26 Mar', submitted: 2, approved: 3, rejected: 1 },
  { date: '27 Mar', submitted: 6, approved: 1, rejected: 0 },
  { date: '28 Mar', submitted: 3, approved: 4, rejected: 0 },
  { date: '29 Mar', submitted: 1, approved: 2, rejected: 1 },
  { date: '31 Mar', submitted: 5, approved: 3, rejected: 0 },
  { date: '1 Apr', submitted: 7, approved: 5, rejected: 1 },
  { date: '2 Apr', submitted: 4, approved: 6, rejected: 0 },
  { date: '3 Apr', submitted: 8, approved: 4, rejected: 2 },
  { date: '4 Apr', submitted: 3, approved: 7, rejected: 0 },
  { date: '5 Apr', submitted: 6, approved: 3, rejected: 1 },
  { date: '7 Apr', submitted: 9, approved: 5, rejected: 0 },
  { date: '8 Apr', submitted: 5, approved: 8, rejected: 1 },
  { date: '9 Apr', submitted: 11, approved: 4, rejected: 0 },
  { date: '10 Apr', submitted: 4, approved: 9, rejected: 2 },
  { date: '12 Apr', submitted: 7, approved: 6, rejected: 1 },
  { date: '14 Apr', submitted: 12, approved: 7, rejected: 0 },
  { date: '15 Apr', submitted: 6, approved: 10, rejected: 1 },
  { date: '16 Apr', submitted: 9, approved: 5, rejected: 0 },
  { date: '17 Apr', submitted: 4, approved: 8, rejected: 3 },
  { date: '18 Apr', submitted: 14, approved: 6, rejected: 1 },
  { date: '19 Apr', submitted: 7, approved: 11, rejected: 0 },
  { date: '21 Apr', submitted: 10, approved: 9, rejected: 2 },
  { date: '22 Apr', submitted: 8, approved: 7, rejected: 1 },
  { date: '23 Apr', submitted: 5, approved: 4, rejected: 0 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-elevated rounded-xl p-3 min-w-[160px]">
        <p className="text-xs text-slate-400 font-mono mb-2">{label}</p>
        {payload.map(p => (
          <div key={`tooltip-${p.name}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-xs text-slate-300 capitalize">{p.name}</span>
            </div>
            <span className="text-xs font-bold font-mono text-white">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ClaimVolumeChart() {
  return (
    <div className="glass-card rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Claim Volume — Last 30 Days</h3>
          <p className="text-xs text-slate-500 mt-0.5">Submissions, approvals, and rejections</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-900/60 border border-slate-700/40 px-2.5 py-1 rounded-lg">
          Apr 2026
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="submitted" stroke="#06b6d4" strokeWidth={2} fill="url(#gradSubmitted)" name="submitted" />
          <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} fill="url(#gradApproved)" name="approved" />
          <Area type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} fill="url(#gradRejected)" name="rejected" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 mt-3 justify-center">
        {[
          { id: 'leg-submitted', color: '#06b6d4', label: 'Submitted' },
          { id: 'leg-approved', color: '#10b981', label: 'Approved' },
          { id: 'leg-rejected', color: '#ef4444', label: 'Rejected' },
        ].map(l => (
          <div key={l.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}