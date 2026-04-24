'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckSquare, Check, X, Eye, Clock, AlertCircle, User } from 'lucide-react';

interface ApprovalItem {
  id: string;
  claimId: string;
  submittedBy: string;
  role: string;
  title: string;
  amount: number;
  category: string;
  submittedDate: string;
  priority: 'high' | 'medium' | 'low';
  daysWaiting: number;
}

const pendingApprovals: ApprovalItem[] = [
  { id: 'APR-001', claimId: 'CLM-2026-012', submittedBy: 'Priya Sharma', role: 'Senior Engineer', title: 'International Conference – Singapore', amount: 85000, category: 'Travel', submittedDate: '2026-04-18', priority: 'high', daysWaiting: 5 },
  { id: 'APR-002', claimId: 'CLM-2026-013', submittedBy: 'Rahul Mehta', role: 'Product Manager', title: 'Client Entertainment – Q2 Kickoff', amount: 12400, category: 'Meals', submittedDate: '2026-04-19', priority: 'medium', daysWaiting: 4 },
  { id: 'APR-003', claimId: 'CLM-2026-014', submittedBy: 'Anita Desai', role: 'Designer', title: 'Adobe Creative Suite – Annual License', amount: 54000, category: 'Software', submittedDate: '2026-04-20', priority: 'low', daysWaiting: 3 },
  { id: 'APR-004', claimId: 'CLM-2026-015', submittedBy: 'Vikram Nair', role: 'Sales Lead', title: 'Mumbai–Pune Business Trip', amount: 8200, category: 'Travel', submittedDate: '2026-04-21', priority: 'medium', daysWaiting: 2 },
  { id: 'APR-005', claimId: 'CLM-2026-016', submittedBy: 'Deepa Krishnan', role: 'HR Manager', title: 'Team Building Workshop', amount: 32000, category: 'Training', submittedDate: '2026-04-22', priority: 'high', daysWaiting: 1 },
];

const priorityConfig = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function ApprovalsPage() {
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const pending = pendingApprovals.filter(a => !approved.includes(a.id) && !rejected.includes(a.id));

  return (
    <AppLayout activeRoute="/approvals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="text-cyan-400" size={24} />
              Approvals
            </h1>
            <p className="text-slate-400 text-sm mt-1">Review and action pending expense claims</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle size={15} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">{pending.length} awaiting your review</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pending.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Approved Today</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{approved.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Rejected Today</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{rejected.length}</p>
          </div>
        </div>

        {/* Approval Cards */}
        <div className="space-y-3">
          {pending.length === 0 && (
            <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
              <CheckSquare size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">All caught up!</p>
              <p className="text-slate-500 text-sm mt-1">No pending approvals at this time.</p>
            </div>
          )}
          {pending.map(item => {
            const pCfg = priorityConfig[item.priority];
            return (
              <div key={item.id} className="glass-card rounded-xl border border-slate-800/60 p-5 hover:border-slate-700/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {item.submittedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-cyan-400/70">{item.claimId}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${pCfg.bg} ${pCfg.color}`}>
                          {pCfg.label} Priority
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User size={11} />{item.submittedBy} · {item.role}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{item.daysWaiting}d waiting</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white font-mono">₹{item.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setRejected(prev => [...prev, item.id])}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => setApproved(prev => [...prev, item.id])}
                        className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
