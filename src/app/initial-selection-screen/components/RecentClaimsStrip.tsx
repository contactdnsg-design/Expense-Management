'use client';
import React from 'react';
import { Copy, Eye, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface RecentClaim {
  id: string;
  claimNo: string;
  type: string;
  expenseType: string;
  partyName: string;
  amount: number;
  date: string;
  status: string;
  statusClass: string;
}

// Backend integration point: fetch from /api/claims?tenant_id=...&user_id=...&limit=5&sort=created_at:desc
const RECENT: RecentClaim[] = [
  { id: 'rclaim-001', claimNo: 'CF-2026-0847', type: 'Post-Claim', expenseType: 'Travel', partyName: 'Reliance Industries', amount: 24500, date: '18-04-2026', status: 'Under Approval', statusClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'rclaim-002', claimNo: 'CF-2026-0831', type: 'Post-Claim', expenseType: 'Hotel', partyName: 'Tata Consultancy', amount: 16800, date: '05-04-2026', status: 'Reimbursed', statusClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { id: 'rclaim-003', claimNo: 'CF-2026-0819', type: 'Pre-Claim', expenseType: 'Travel', partyName: 'Infosys Ltd.', amount: 38000, date: '28-03-2026', status: 'Reimbursed', statusClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { id: 'rclaim-004', claimNo: 'CF-2026-0804', type: 'Post-Claim', expenseType: 'Meals', partyName: 'HCL Technologies', amount: 5200, date: '15-03-2026', status: 'Reimbursed', statusClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { id: 'rclaim-005', claimNo: 'CF-2026-0798', type: 'Post-Claim', expenseType: 'Mileage', partyName: 'Wipro Ltd.', amount: 2800, date: '10-03-2026', status: 'Reimbursed', statusClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
];

export default function RecentClaimsStrip() {
  const handleClone = (claimNo: string) => {
    // Backend integration point: POST /api/claims/clone with source claim_id
    toast.success(`Cloning ${claimNo} — you'll be redirected to edit the copy`);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Quick Start — Recent Claims</h3>
          <p className="text-xs text-slate-500 mt-0.5">Clone a previous claim to skip re-entry of common details</p>
        </div>
        <Link href="/expense-claims-dashboard" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-slate-800/40">
        {RECENT.map(claim => (
          <div key={claim.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors group">
            <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs font-mono text-cyan-400">{claim.claimNo}</p>
                <p className="text-xs text-slate-500">{claim.type}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-300">{claim.expenseType}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400 truncate">{claim.partyName}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-mono font-semibold text-white">₹{claim.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 font-mono">{claim.date}</p>
              </div>
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${claim.statusClass}`}>
                  {claim.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                title="View claim details"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => handleClone(claim.claimNo)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition-all"
                title="Clone this claim to pre-fill a new one"
              >
                <Copy size={12} />
                Clone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}