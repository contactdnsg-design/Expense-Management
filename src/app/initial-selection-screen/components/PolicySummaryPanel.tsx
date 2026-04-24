'use client';
import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PolicyLimit {
  id: string;
  category: string;
  travelType: string;
  maxAmount: number;
  currency: string;
  period: string;
  status: 'ok' | 'warning';
}

// Backend integration point: fetch from /api/policies?tenant_id=...&active=true
const POLICIES: PolicyLimit[] = [
  { id: 'pol-001', category: 'Travel — Flight', travelType: 'Outstation', maxAmount: 15000, currency: 'INR', period: 'Per trip', status: 'ok' },
  { id: 'pol-002', category: 'Travel — Train', travelType: 'Outstation', maxAmount: 3000, currency: 'INR', period: 'Per trip', status: 'ok' },
  { id: 'pol-003', category: 'Hotel', travelType: 'Outstation', maxAmount: 5000, currency: 'INR', period: 'Per night', status: 'ok' },
  { id: 'pol-004', category: 'Meals', travelType: 'Local', maxAmount: 800, currency: 'INR', period: 'Per day', status: 'ok' },
  { id: 'pol-005', category: 'Meals', travelType: 'Outstation', maxAmount: 1500, currency: 'INR', period: 'Per day', status: 'ok' },
  { id: 'pol-006', category: 'Mileage', travelType: 'Local', maxAmount: 12, currency: 'INR', period: 'Per KM', status: 'ok' },
  { id: 'pol-007', category: 'Miscellaneous', travelType: 'Any', maxAmount: 2000, currency: 'INR', period: 'Per claim', status: 'warning' },
  { id: 'pol-008', category: 'Per Diem', travelType: 'Outstation', maxAmount: 2500, currency: 'INR', period: 'Per day', status: 'ok' },
];

export default function PolicySummaryPanel() {
  const [expanded, setExpanded] = useState(true);

  const violations = POLICIES.filter(p => p.status === 'warning').length;

  return (
    <div className="glass-card rounded-2xl overflow-hidden sticky top-6">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full px-5 py-4 border-b border-slate-800/60 flex items-center justify-between hover:bg-white/3 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <Shield size={16} className="text-cyan-400" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Policy Limits</h3>
            <p className="text-xs text-slate-500 mt-0.5">FY 2026 · Sales Dept</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {violations > 0 && (
            <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              {violations} note
            </span>
          )}
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-slate-800/40">
          {POLICIES.map(policy => (
            <div key={policy.id} className="px-5 py-3 flex items-start justify-between gap-2 hover:bg-white/2 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {policy.status === 'warning'
                    ? <AlertTriangle size={11} className="text-amber-400 flex-shrink-0" />
                    : <CheckCircle2 size={11} className="text-emerald-400/60 flex-shrink-0" />
                  }
                  <p className={`text-xs font-medium truncate ${policy.status === 'warning' ? 'text-amber-300' : 'text-slate-300'}`}>
                    {policy.category}
                  </p>
                </div>
                <p className="text-xs text-slate-600 pl-4">{policy.travelType} · {policy.period}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono font-bold text-white">
                  {policy.currency} {policy.maxAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-600">max</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && (
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30">
          <p className="text-xs text-slate-600 leading-relaxed">
            Amounts exceeding these limits will trigger the extended approval flow including Audit Team review.
          </p>
          <button className="text-xs text-cyan-400 hover:text-cyan-300 mt-1.5 transition-colors">
            View full policy document →
          </button>
        </div>
      )}
    </div>
  );
}