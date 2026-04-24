'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileText, Plus, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react';



interface Claim {
  id: string;
  title: string;
  type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedDate: string;
  category: string;
}

const mockClaims: Claim[] = [
  { id: 'CLM-2026-001', title: 'Business Travel – Mumbai to Delhi', type: 'Travel', amount: 18500, currency: 'INR', status: 'approved', submittedDate: '2026-04-10', category: 'Travel' },
  { id: 'CLM-2026-002', title: 'Client Dinner – Q1 Review', type: 'Meals', amount: 4200, currency: 'INR', status: 'pending', submittedDate: '2026-04-15', category: 'Meals & Entertainment' },
  { id: 'CLM-2026-003', title: 'AWS Cloud Services – March', type: 'Software', amount: 12800, currency: 'INR', status: 'approved', submittedDate: '2026-04-02', category: 'Software & Tools' },
  { id: 'CLM-2026-004', title: 'Office Supplies – Q1', type: 'Office', amount: 3100, currency: 'INR', status: 'rejected', submittedDate: '2026-03-28', category: 'Office Supplies' },
  { id: 'CLM-2026-005', title: 'Conference Registration – TechSummit', type: 'Training', amount: 25000, currency: 'INR', status: 'pending', submittedDate: '2026-04-18', category: 'Training & Development' },
  { id: 'CLM-2026-006', title: 'Hotel Stay – Bangalore Trip', type: 'Travel', amount: 9600, currency: 'INR', status: 'draft', submittedDate: '2026-04-20', category: 'Travel' },
  { id: 'CLM-2026-007', title: 'Internet Reimbursement – April', type: 'Utilities', amount: 1499, currency: 'INR', status: 'approved', submittedDate: '2026-04-01', category: 'Utilities' },
  { id: 'CLM-2026-008', title: 'Team Lunch – Sprint Completion', type: 'Meals', amount: 6800, currency: 'INR', status: 'pending', submittedDate: '2026-04-19', category: 'Meals & Entertainment' },
];

const statusConfig = {
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  draft: { label: 'Draft', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function MyClaimsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = mockClaims.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, c) => sum + c.amount, 0);

  return (
    <AppLayout activeRoute="/my-claims">
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="text-cyan-400" size={24} />
              My Claims
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track and manage all your expense claims</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold rounded-lg transition-all duration-200 active:scale-95 text-sm hover:-translate-y-0.5" style={{ boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
            <Plus size={16} />
            New Claim
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status, idx) => {
            const count = status === 'all' ? mockClaims.length : mockClaims.filter(c => c.status === status).length;
            const amount = (status === 'all' ? mockClaims : mockClaims.filter(c => c.status === status)).reduce((s, c) => s + c.amount, 0);
            const labels: Record<string, string> = { all: 'Total Claims', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
            const colors: Record<string, string> = { all: 'text-cyan-400', pending: 'text-amber-400', approved: 'text-emerald-400', rejected: 'text-red-400' };
            return (
              <div key={status} className="glass-card metric-card rounded-xl p-4 border border-slate-800/60" style={{ animationDelay: `${idx * 0.05}s` }}>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{labels[status]}</p>
                <p className={`text-2xl font-bold mt-1 font-mono ${colors[status]}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Claims Table */}
        <div className="glass-card rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Claim ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map(claim => {
                  const cfg = statusConfig[claim.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={claim.id} className="table-row-hover cursor-pointer group">
                      <td className="px-5 py-4 font-mono text-xs text-cyan-400/80 group-hover:text-cyan-400 transition-colors">{claim.id}</td>
                      <td className="px-5 py-4 text-slate-200 font-medium max-w-xs truncate">{claim.title}</td>
                      <td className="px-5 py-4 text-slate-400">{claim.category}</td>
                      <td className="px-5 py-4 text-slate-200 font-mono font-semibold">₹{claim.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-400">{claim.submittedDate}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/20">
            <p className="text-xs text-slate-500">{filtered.length} claims · Total: <span className="text-slate-300 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span></p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
