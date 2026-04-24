'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { preClaimService, postClaimService, exceptionClaimService } from '@/lib/services/claimService';
import { createClient } from '@/lib/supabase/client';
import type { PreClaim, PostClaim, ExceptionClaim } from '@/lib/types/claims';
import { FileText, Plus, Clock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type TabType = 'all' | 'pre' | 'post' | 'exception';

export default function MyClaimsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);
  const [preClaims, setPreClaims] = useState<PreClaim[]>([]);
  const [postClaims, setPostClaims] = useState<PostClaim[]>([]);
  const [exceptionClaims, setExceptionClaims] = useState<ExceptionClaim[]>([]);

  useEffect(() => { loadClaims(); }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [pre, post, exc] = await Promise.all([
        preClaimService.getAll(user.id),
        postClaimService.getAll(user.id),
        exceptionClaimService.getAll(user.id),
      ]);
      setPreClaims(pre);
      setPostClaims(post);
      setExceptionClaims(exc);
    } finally {
      setLoading(false);
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
      converted: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
      escalated: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    };
    return map[status] || 'bg-slate-700/60 text-slate-400';
  };

  const allClaims = [
    ...preClaims.map(c => ({ ...c, claimKind: 'pre' as const })),
    ...postClaims.map(c => ({ ...c, claimKind: 'post' as const })),
    ...exceptionClaims.map(c => ({ ...c, claimKind: 'exception' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredClaims = activeTab === 'all' ? allClaims :
    activeTab === 'pre' ? allClaims.filter(c => c.claimKind === 'pre') :
    activeTab === 'post' ? allClaims.filter(c => c.claimKind === 'post') :
    allClaims.filter(c => c.claimKind === 'exception');

  const TABS = [
    { id: 'all' as TabType, label: 'All Claims', count: allClaims.length },
    { id: 'pre' as TabType, label: 'Pre-Claims', count: preClaims.length },
    { id: 'post' as TabType, label: 'Post-Claims', count: postClaims.length },
    { id: 'exception' as TabType, label: 'Exceptions', count: exceptionClaims.length },
  ];

  return (
    <AppLayout activeRoute="/my-claims">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="text-cyan-400" size={24} />
              My Claims
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track all your expense claims and their status</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadClaims} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white text-sm transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link href="/initial-selection-screen" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors">
              <Plus size={16} /> New Claim
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Claims</p>
            <p className="text-2xl font-bold text-white mt-1">{allClaims.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{allClaims.filter(c => ['submitted', 'under_review'].includes(c.status)).length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{allClaims.filter(c => ['approved', 'advance_released', 'paid'].includes(c.status)).length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Amount</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono text-lg">
              ₹{(
                preClaims.reduce((s, c) => s + c.estimatedTotal, 0) +
                postClaims.reduce((s, c) => s + c.totalClaimed, 0) +
                exceptionClaims.reduce((s, c) => s + c.amount, 0)
              ).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-800/60 pb-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${
                activeTab === tab.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {tab.label}
              {tab.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="glass-card rounded-xl border border-slate-800/60 p-12 text-center">
            <FileText size={40} className="text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No claims yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-4">Start by creating your first expense claim</p>
            <Link href="/initial-selection-screen" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors">
              <Plus size={16} /> Create Claim
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClaims.map((claim: any) => (
              <div key={claim.id} className="glass-card rounded-xl border border-slate-800/60 p-5 hover:border-slate-700/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`font-mono text-xs ${
                        claim.claimKind === 'pre' ? 'text-cyan-400/70' :
                        claim.claimKind === 'post' ? 'text-violet-400/70' :
                        'text-amber-400/70'
                      }`}>{claim.claimNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(claim.status)}`}>
                        {claim.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        claim.claimKind === 'pre' ? 'bg-cyan-500/10 text-cyan-400' :
                        claim.claimKind === 'post' ? 'bg-violet-500/10 text-violet-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {claim.claimKind === 'pre' ? 'Pre-Claim' : claim.claimKind === 'post' ? 'Post-Claim' : 'Exception'}
                      </span>
                    </div>
                    <p className="text-slate-200 font-semibold">{claim.purpose}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {(claim.travelFrom || claim.travelTo) && (
                        <span>{claim.travelFrom} → {claim.travelTo}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white font-mono">
                        ₹{(claim.estimatedTotal || claim.totalClaimed || claim.amount || 0).toLocaleString('en-IN')}
                      </p>
                      {claim.claimKind === 'pre' && claim.advanceSanctioned > 0 && (
                        <p className="text-xs text-cyan-400">Advance: ₹{claim.advanceSanctioned.toLocaleString('en-IN')}</p>
                      )}
                      {claim.claimKind === 'post' && claim.settlementType && (
                        <p className={`text-xs font-medium ${claim.settlementType === 'reimbursement' ? 'text-emerald-400' : claim.settlementType === 'recovery' ? 'text-red-400' : 'text-slate-400'}`}>
                          {claim.settlementType.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                    {claim.claimKind === 'pre' && claim.status === 'approved' && !claim.convertedToPostClaimId && (
                      <Link href={`/claims/post-claim?pre_claim_id=${claim.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/20 text-xs font-medium transition-colors whitespace-nowrap">
                        Settle <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
