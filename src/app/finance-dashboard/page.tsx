'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { postClaimService, exceptionClaimService, auditService } from '@/lib/services/claimService';
import { createClient } from '@/lib/supabase/client';
import type { PostClaim, ExceptionClaim, AuditLog } from '@/lib/types/claims';
import { Building2, DollarSign, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Loader2, RefreshCw, CreditCard, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'overview' | 'payments' | 'violations' | 'audit';

export default function FinanceDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [postClaims, setPostClaims] = useState<PostClaim[]>([]);
  const [exceptionClaims, setExceptionClaims] = useState<ExceptionClaim[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [post, exc, logs] = await Promise.all([
        postClaimService.getAll(),
        exceptionClaimService.getAll(),
        auditService.getAll(50),
      ]);
      setPostClaims(post);
      setExceptionClaims(exc);
      setAuditLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (claimId: string) => {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) return;
    setActionLoading(claimId);
    try {
      await postClaimService.updateStatus(claimId, 'paid', user.id);
      toast.success('Claim marked as paid');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (claimId: string) => {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) return;
    setActionLoading(claimId);
    try {
      await postClaimService.updateStatus(claimId, 'closed', user.id);
      toast.success('Claim closed');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const approvedClaims = postClaims.filter(c => c.status === 'approved');
  const paidClaims = postClaims.filter(c => c.status === 'paid');
  const totalPendingPayment = approvedClaims.filter(c => c.settlementType === 'reimbursement').reduce((s, c) => s + c.settlementAmount, 0);
  const totalRecovery = approvedClaims.filter(c => c.settlementType === 'recovery').reduce((s, c) => s + c.settlementAmount, 0);
  const violationClaims = postClaims.filter(c => (c.policyViolations?.length || 0) > 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      paid: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
      closed: 'bg-slate-700/60 text-slate-400',
      under_review: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
      rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
    };
    return map[status] || 'bg-slate-700/60 text-slate-400';
  };

  const TABS = [
    { id: 'overview' as TabType, label: 'Overview', icon: <Building2 size={15} /> },
    { id: 'payments' as TabType, label: 'Payments & Recovery', icon: <DollarSign size={15} />, count: approvedClaims.length },
    { id: 'violations' as TabType, label: 'Policy Violations', icon: <AlertTriangle size={15} />, count: violationClaims.length },
    { id: 'audit' as TabType, label: 'Audit Flags', icon: <Shield size={15} /> },
  ];

  return (
    <AppLayout activeRoute="/compliance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building2 className="text-emerald-400" size={24} />
              Finance Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Payment processing, policy violations, and audit controls</p>
          </div>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white text-sm transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Payouts</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">₹{totalPendingPayment.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">{approvedClaims.filter(c => c.settlementType === 'reimbursement').length} claims</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-red-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Recovery</p>
            </div>
            <p className="text-2xl font-bold text-red-400 font-mono">₹{totalRecovery.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">{approvedClaims.filter(c => c.settlementType === 'recovery').length} claims</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Policy Violations</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{violationClaims.length}</p>
            <p className="text-xs text-slate-500 mt-1">Require review</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-cyan-400" />
              <p className="text-xs text-slate-500 uppercase tracking-wide">Paid This Month</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{paidClaims.length}</p>
            <p className="text-xs text-slate-500 mt-1">Claims settled</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-800/60 pb-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Settlement Breakdown */}
                  <div className="glass-card rounded-xl border border-slate-800/60 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Settlement Breakdown</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Reimbursements', count: postClaims.filter(c => c.settlementType === 'reimbursement').length, color: 'text-emerald-400', bg: 'bg-emerald-500' },
                        { label: 'Recoveries', count: postClaims.filter(c => c.settlementType === 'recovery').length, color: 'text-red-400', bg: 'bg-red-500' },
                        { label: 'Exact Match', count: postClaims.filter(c => c.settlementType === 'exact_match').length, color: 'text-slate-400', bg: 'bg-slate-500' },
                        { label: 'Pending Settlement', count: postClaims.filter(c => !c.settlementType).length, color: 'text-amber-400', bg: 'bg-amber-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.bg}`} />
                          <span className="text-sm text-slate-400 flex-1">{item.label}</span>
                          <span className={`text-sm font-bold font-mono ${item.color}`}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exception Summary */}
                  <div className="glass-card rounded-xl border border-slate-800/60 p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Exception Claims</h3>
                    <div className="space-y-3">
                      {['no_pre_approval', 'policy_violation', 'lost_bill', 'per_diem', 'recurring', 'corporate_card_reconciliation'].map(type => {
                        const count = exceptionClaims.filter(c => c.exceptionType === type).length;
                        if (count === 0) return null;
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <AlertTriangle size={12} className="text-amber-400" />
                            <span className="text-sm text-slate-400 flex-1 capitalize">{type.replace(/_/g, ' ')}</span>
                            <span className="text-sm font-bold font-mono text-amber-400">{count}</span>
                          </div>
                        );
                      })}
                      {exceptionClaims.length === 0 && <p className="text-sm text-slate-500">No exception claims</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments & Recovery */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                {approvedClaims.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <DollarSign size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No claims pending payment</p>
                  </div>
                ) : approvedClaims.map(claim => (
                  <div key={claim.id} className="glass-card rounded-xl border border-slate-800/60 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-violet-400/70">{claim.claimNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>{claim.status}</span>
                          {claim.settlementType && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              claim.settlementType === 'reimbursement' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                              claim.settlementType === 'recovery'? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-slate-700/60 text-slate-400'
                            }`}>{claim.settlementType.replace('_', ' ')}</span>
                          )}
                        </div>
                        <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                        <p className="text-xs text-slate-500 mt-1">{claim.employee?.fullName} · {claim.employee?.department}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-mono">₹{claim.totalClaimed.toLocaleString('en-IN')}</p>
                          {claim.settlementAmount > 0 && (
                            <p className={`text-sm font-bold font-mono ${claim.settlementType === 'reimbursement' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {claim.settlementType === 'reimbursement' ? '+' : '-'}₹{claim.settlementAmount.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {claim.settlementType === 'reimbursement' && (
                            <button onClick={() => handleMarkPaid(claim.id)} disabled={actionLoading === claim.id}
                              className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                              {actionLoading === claim.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />} Pay
                            </button>
                          )}
                          {claim.settlementType === 'recovery' && (
                            <button onClick={() => handleMarkPaid(claim.id)} disabled={actionLoading === claim.id}
                              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                              {actionLoading === claim.id ? <Loader2 size={14} className="animate-spin" /> : <TrendingDown size={14} />} Recover
                            </button>
                          )}
                          <button onClick={() => handleClose(claim.id)} disabled={actionLoading === claim.id}
                            className="px-3 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white text-sm transition-colors">
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Policy Violations */}
            {activeTab === 'violations' && (
              <div className="space-y-3">
                {violationClaims.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">No policy violations</p>
                    <p className="text-slate-500 text-sm mt-1">All claims are within policy limits.</p>
                  </div>
                ) : violationClaims.map(claim => (
                  <div key={claim.id} className="glass-card rounded-xl border border-red-500/20 p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-red-400/70">{claim.claimNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>{claim.status}</span>
                          </div>
                          <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                          <p className="text-xs text-slate-500 mt-1">{claim.employee?.fullName}</p>
                        </div>
                        <p className="text-lg font-bold text-white font-mono flex-shrink-0">₹{claim.totalClaimed.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="space-y-2">
                        {claim.policyViolations?.map((v: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/8 border border-red-500/15">
                            <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300">{v.message || v.category}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Flags */}
            {activeTab === 'audit' && (
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <Shield size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No audit logs</p>
                  </div>
                ) : auditLogs.map(log => (
                  <div key={log.id} className="glass-card rounded-xl border border-slate-800/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                        <Activity size={14} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-emerald-400">{log.action}</span>
                          {log.claimType && <span className="text-xs text-slate-500 capitalize">{log.claimType.replace('_', ' ')}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{log.actor?.fullName || 'System'}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
