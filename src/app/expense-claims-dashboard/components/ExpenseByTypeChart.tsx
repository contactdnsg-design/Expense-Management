'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// Backend integration point: fetch from /api/claims/by-type?tenant_id=...&period=mtd
const data = [
  { type: 'Travel', amount: 142800, claims: 18, color: '#06b6d4' },
  { type: 'Hotel', amount: 98500, claims: 12, color: '#8b5cf6' },
  { type: 'Meals', amount: 54200, claims: 24, color: '#f59e0b' },
  { type: 'Mileage', amount: 38900, claims: 31, color: '#10b981' },
  { type: 'Per Diem', amount: 29400, claims: 9, color: '#3b82f6' },
  { type: 'Misc', amount: 17600, claims: 7, color: '#64748b' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { claims: number } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-elevated rounded-xl p-3">
        <p className="text-xs text-slate-400 font-mono mb-1">{label}</p>
        <p className="text-sm font-bold text-white font-mono">₹{payload[0].value.toLocaleString('en-IN')}</p>
        <p className="text-xs text-slate-500">{payload[0].payload.claims} claims</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseByTypeChart() {
  return (
    <div className="glass-card rounded-2xl p-5 h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">Amount by Expense Type</h3>
        <p className="text-xs text-slate-500 mt-0.5">Month-to-date · April 2026</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="type"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.type}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-4 space-y-1.5">
        {data.map(d => (
          <div key={`legend-${d.type}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-slate-400">{d.type}</span>
            </div>
            <span className="text-xs font-mono text-slate-300">₹{d.amount.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}