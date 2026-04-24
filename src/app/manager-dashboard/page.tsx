'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { approvalService, preClaimService, postClaimService, exceptionClaimService, auditService } from '@/lib/services/claimService';
import { createClient } from '@/lib/supabase/client';
import type { ApprovalStep, PreClaim, PostClaim, ExceptionClaim, AuditLog } from '@/lib/types/claims';
import { CheckSquare, Check, X, FileText, AlertTriangle, DollarSign, Shield, Activity, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'pending' | 'pre_claims' | 'post_claims' | 'exceptions' | 'audit';

export default function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);
  const [pendingSteps, setPendingSteps] = useState<ApprovalStep[]>([]);
  const [preClaims, setPreClaims] = useState<PreClaim[]>([]);
  const [postClaims, setPostClaims] = useState<PostClaim[]>([]);
  const [exceptionClaims, setExceptionClaims] = useState<ExceptionClaim[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [steps, pre, post, exc, logs] = await Promise.all([
        approvalService.getAllPending(),
        preClaimService.getAll(),
        postClaimService.getAll(),
        exceptionClaimService.getAll(),
        auditService.getAll(30),
      ]);
      setPendingSteps(steps);
      setPreClaims(pre);
      setPostClaims(post);
      setExceptionClaims(exc);
      setAuditLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (step: ApprovalStep, action: 'approved' | 'rejected') => {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) return;
    setActionLoading(step.id);
    try {
      const comment = commentMap[step.id] || '';
      await approvalService.act(step.id, action, comment, user.id);

      // Update claim status based on action
      if (action === 'approved') {
        if (step.claimType === 'pre_claim') await preClaimService.updateStatus(step.claimId, 'approved', user.id);
        if (step.claimType === 'post_claim') await postClaimService.updateStatus(step.claimId, 'approved', user.id);
      } else {
        if (step.claimType === 'pre_claim') await preClaimService.updateStatus(step.claimId, 'rejected', user.id);
        if (step.claimType === 'post_claim') await postClaimService.updateStatus(step.claimId, 'rejected', user.id);
      }

      toast.success(`Claim ${action} successfully`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-700/60 text-slate-400',
      submitted: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
      under_review: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
      approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      advance_released: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
      rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
      paid: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      closed: 'bg-slate-700/60 text-slate-400',
      escalated: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    };
    return map[status] || 'bg-slate-700/60 text-slate-400';
  };

  const TABS = [
    { id: 'pending' as TabType, label: 'Pending Approvals', icon: <CheckSquare size={15} />, count: pendingSteps.length },
    { id: 'pre_claims' as TabType, label: 'Pre-Claims', icon: <FileText size={15} />, count: preClaims.length },
    { id: 'post_claims' as TabType, label: 'Post-Claims', icon: <DollarSign size={15} />, count: postClaims.length },
    { id: 'exceptions' as TabType, label: 'Exceptions', icon: <AlertTriangle size={15} />, count: exceptionClaims.length },
    { id: 'audit' as TabType, label: 'Audit Log', icon: <Activity size={15} />, count: auditLogs.length },
  ];

  return (
    <AppLayout activeRoute="/approvals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-cyan-400" size={24} />
              Manager Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Approval workflow, budget visibility, and claim oversight</p>
          </div>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white text-sm transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingSteps.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Active Pre-Claims</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{preClaims.filter(c => !['closed','rejected'].includes(c.status)).length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Post-Claims Under Review</p>
            <p className="text-2xl font-bold text-violet-400 mt-1">{postClaims.filter(c => c.status === 'under_review').length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Exception Flags</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{exceptionClaims.filter(c => c.status === 'escalated').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-800/60 pb-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
                activeTab === tab.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {tab.icon} {tab.label}
              {tab.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            {/* Pending Approvals Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-3">
                {pendingSteps.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <CheckSquare size={40} className="text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium">All caught up!</p>
                    <p className="text-slate-500 text-sm mt-1">No pending approvals at this time.</p>
                  </div>
                ) : pendingSteps.map(step => (
                  <div key={step.id} className="glass-card rounded-xl border border-slate-800/60 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            step.claimType === 'pre_claim' ? 'bg-cyan-500/15 text-cyan-400' :
                            step.claimType === 'post_claim' ? 'bg-violet-500/15 text-violet-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {step.claimType.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">Level {step.level} · {step.approverRole}</span>
                        </div>
                        <p className="text-slate-300 font-medium font-mono text-sm">{step.claimId.slice(0, 8)}…</p>
                        <p className="text-xs text-slate-500 mt-1">Submitted {new Date(step.createdAt).toLocaleDateString('en-IN')}</p>
                        <div className="mt-3">
                          <input
                            value={commentMap[step.id] || ''}
                            onChange={e => setCommentMap(m => ({ ...m, [step.id]: e.target.value }))}
                            placeholder="Add comment (optional)"
                            className="w-full bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprovalAction(step, 'rejected')}
                          disabled={actionLoading === step.id}
                          className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading === step.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
                        </button>
                        <button
                          onClick={() => handleApprovalAction(step, 'approved')}
                          disabled={actionLoading === step.id}
                          className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading === step.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pre-Claims Tab */}
            {activeTab === 'pre_claims' && (
              <div className="space-y-3">
                {preClaims.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <FileText size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No pre-claims found</p>
                  </div>
                ) : preClaims.map(claim => (
                  <div key={claim.id} className="glass-card rounded-xl border border-slate-800/60 overflow-hidden">
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 cursor-pointer" onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-cyan-400/70">{claim.claimNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>{claim.status.replace('_', ' ')}</span>
                          {claim.policyBreaches?.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Policy Breach</span>}
                        </div>
                        <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                        <p className="text-xs text-slate-500 mt-1">{claim.employee?.fullName} · {claim.travelFrom} → {claim.travelTo}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-mono">₹{claim.estimatedTotal.toLocaleString('en-IN')}</p>
                          {claim.advanceSanctioned > 0 && <p className="text-xs text-cyan-400">Advance: ₹{claim.advanceSanctioned.toLocaleString('en-IN')}</p>}
                        </div>
                        {expandedClaim === claim.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>
                    {expandedClaim === claim.id && (
                      <div className="border-t border-slate-800/60 p-5 bg-slate-900/30 space-y-3">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {claim.budgetLines?.map((bl, i) => (
                            <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
                              <p className="text-xs text-slate-500 capitalize">{bl.category}</p>
                              <p className="text-sm font-bold text-white font-mono mt-0.5">₹{bl.estimatedAmount.toLocaleString('en-IN')}</p>
                              {!bl.withinPolicy && <p className="text-xs text-red-400 mt-0.5">Over limit</p>}
                            </div>
                          ))}
                        </div>
                        {claim.approvalSteps && claim.approvalSteps.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Approval Chain</p>
                            {claim.approvalSteps.map((step, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  step.action === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                  step.action === 'rejected'? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
                                }`}>{step.level}</div>
                                <span className="text-slate-400">{step.approverRole}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  step.action === 'approved' ? 'text-emerald-400' :
                                  step.action === 'rejected'? 'text-red-400' : 'text-slate-500'
                                }`}>{step.action}</span>
                                {step.comments && <span className="text-slate-500 italic">"{step.comments}"</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post-Claims Tab */}
            {activeTab === 'post_claims' && (
              <div className="space-y-3">
                {postClaims.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <DollarSign size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No post-claims found</p>
                  </div>
                ) : postClaims.map(claim => (
                  <div key={claim.id} className="glass-card rounded-xl border border-slate-800/60 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-violet-400/70">{claim.claimNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>{claim.status.replace('_', ' ')}</span>
                          {claim.policyViolations?.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">{claim.policyViolations.length} violations</span>}
                          {claim.preClaimId && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Linked</span>}
                        </div>
                        <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                        <p className="text-xs text-slate-500 mt-1">{claim.employee?.fullName} · {claim.expenseItems?.length || 0} expense items</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white font-mono">₹{claim.totalClaimed.toLocaleString('en-IN')}</p>
                        {claim.settlementType && (
                          <p className={`text-xs font-medium ${claim.settlementType === 'reimbursement' ? 'text-emerald-400' : claim.settlementType === 'recovery' ? 'text-red-400' : 'text-slate-400'}`}>
                            {claim.settlementType === 'reimbursement' ? `+₹${claim.settlementAmount.toLocaleString('en-IN')} due` :
                             claim.settlementType === 'recovery' ? `-₹${claim.settlementAmount.toLocaleString('en-IN')} recovery` :
                             'Exact match'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exceptions Tab */}
            {activeTab === 'exceptions' && (
              <div className="space-y-3">
                {exceptionClaims.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <AlertTriangle size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No exception claims</p>
                  </div>
                ) : exceptionClaims.map(claim => (
                  <div key={claim.id} className="glass-card rounded-xl border border-amber-500/20 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-amber-400/70">{claim.claimNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>{claim.status}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">{claim.exceptionType.replace('_', ' ')}</span>
                          {claim.policyDeviationFlag && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Policy Deviation</span>}
                        </div>
                        <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                        <p className="text-xs text-slate-500 mt-1">{claim.employee?.fullName} · {new Date(claim.createdAt).toLocaleDateString('en-IN')}</p>
                        <p className="text-xs text-slate-400 mt-2 italic">"{claim.justification}"</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white font-mono">₹{claim.amount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
                    <Activity size={40} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No audit logs</p>
                  </div>
                ) : auditLogs.map(log => (
                  <div key={log.id} className="glass-card rounded-xl border border-slate-800/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                        <Activity size={14} className="text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-cyan-400">{log.action}</span>
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
