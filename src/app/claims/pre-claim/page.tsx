'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { preClaimService } from '@/lib/services/claimService';

import type { PreClaim, PreClaimBudgetLine, ClaimCategory, CityTier, PaymentMode } from '@/lib/types/claims';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, DollarSign, FileText, Upload, Loader2, Building2, Utensils, Car, Package, Plus, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Purpose & Dates', icon: <FileText size={16} /> },
  { id: 2, label: 'Budget Lines', icon: <DollarSign size={16} /> },
  { id: 3, label: 'Policy Check', icon: <CheckCircle2 size={16} /> },
  { id: 4, label: 'Advance Request', icon: <Building2 size={16} /> },
  { id: 5, label: 'Review & Submit', icon: <Upload size={16} /> },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  travel: <Car size={14} />, hotel: <Building2 size={14} />,
  food: <Utensils size={14} />, misc: <Package size={14} />,
  transport: <Car size={14} />, entertainment: <Package size={14} />,
};

const CATEGORIES: ClaimCategory[] = ['travel', 'hotel', 'food', 'transport', 'misc', 'entertainment', 'medical'];

const CITY_TIERS: { value: CityTier; label: string }[] = [
  { value: 'tier1', label: 'Tier 1 (Metro)' },
  { value: 'tier2', label: 'Tier 2 (Major City)' },
  { value: 'tier3', label: 'Tier 3 (Small City)' },
  { value: 'international', label: 'International' },
];

const POLICY_LIMITS: Record<string, Record<string, number>> = {
  tier1: { hotel: 8000, food: 1200, travel: 20000, transport: 1500, misc: 2000 },
  tier2: { hotel: 5000, food: 800, travel: 15000, transport: 1000, misc: 1500 },
  tier3: { hotel: 3000, food: 600, travel: 10000, transport: 800, misc: 1000 },
  international: { hotel: 15000, food: 3000, travel: 80000, transport: 3000, misc: 5000 },
};

function PreClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdClaim, setCreatedClaim] = useState<PreClaim | null>(null);

  const [form, setForm] = useState({
    purpose: '', description: '', travelFrom: '', travelTo: '',
    startDate: '', endDate: '', cityTier: 'tier2' as CityTier, justification: '',
    advanceRequested: 0, advanceMode: 'bank_transfer' as PaymentMode,
  });

  const [budgetLines, setBudgetLines] = useState<Partial<PreClaimBudgetLine>[]>([
    { category: 'travel', estimatedAmount: 0, notes: '' },
    { category: 'hotel', estimatedAmount: 0, notes: '' },
    { category: 'food', estimatedAmount: 0, notes: '' },
  ]);

  const [policyResult, setPolicyResult] = useState<{ warnings: any[]; breaches: any[] } | null>(null);

  const totalEstimated = budgetLines.reduce((s, l) => s + (l.estimatedAmount || 0), 0);

  const getPolicyLimit = (cat: string) => POLICY_LIMITS[form.cityTier]?.[cat];

  const checkPolicy = () => {
    const warnings: any[] = [];
    const breaches: any[] = [];
    budgetLines.forEach(line => {
      const limit = getPolicyLimit(line.category || '');
      if (!limit || !line.estimatedAmount) return;
      if (line.estimatedAmount > limit) {
        breaches.push({ category: line.category, message: `Exceeds limit of ₹${limit.toLocaleString('en-IN')}`, limit, claimed: line.estimatedAmount });
      } else if (line.estimatedAmount > limit * 0.85) {
        warnings.push({ category: line.category, message: `Approaching limit of ₹${limit.toLocaleString('en-IN')}`, limit, claimed: line.estimatedAmount });
      }
    });
    setPolicyResult({ warnings, breaches });
  };

  const handleNext = async () => {
    if (step === 2) checkPolicy();
    if (step < 5) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const claim = await preClaimService.create({
        ...form,
        estimatedTotal: totalEstimated,
        budgetLines: budgetLines.filter(l => (l.estimatedAmount || 0) > 0),
      } as any);

      if (!claim) throw new Error('Failed to create claim');
      setCreatedClaim(claim);

      if (form.advanceRequested > 0) {
        await preClaimService.submit(claim.id);
        toast.success(`Pre-Claim ${claim.claimNumber} submitted for approval!`);
      } else {
        await preClaimService.submit(claim.id);
        toast.success(`Pre-Claim ${claim.claimNumber} submitted!`);
      }

      setTimeout(() => router.push('/my-claims'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const addBudgetLine = () => {
    setBudgetLines(prev => [...prev, { category: 'misc', estimatedAmount: 0, notes: '' }]);
  };

  const removeBudgetLine = (idx: number) => {
    setBudgetLines(prev => prev.filter((_, i) => i !== idx));
  };

  const updateBudgetLine = (idx: number, field: string, value: any) => {
    setBudgetLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  return (
    <AppLayout activeRoute="/initial-selection-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/initial-selection-screen')} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">New Pre-Claim</h1>
            <p className="text-slate-400 text-sm">Request advance approval before your expense</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="glass-card rounded-2xl border border-slate-800/60 p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    step === s.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                    step > s.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer': 'text-slate-500 border border-transparent'
                  }`}
                >
                  {step > s.id ? <CheckCircle2 size={14} /> : s.icon}
                  <span>{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-700 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
          {/* Step 1: Purpose & Dates */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Purpose & Travel Details</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Purpose *</label>
                  <input
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="e.g. Client visit, Conference attendance, Project kick-off"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Business justification — why is this expense needed?"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">From Location</label>
                    <input
                      value={form.travelFrom}
                      onChange={e => setForm(f => ({ ...f, travelFrom: e.target.value }))}
                      placeholder="Bangalore"
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">To Location</label>
                    <input
                      value={form.travelTo}
                      onChange={e => setForm(f => ({ ...f, travelTo: e.target.value }))}
                      placeholder="Mumbai"
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination City Tier</label>
                  <select value={form.cityTier} onChange={e => setForm(f => ({ ...f, cityTier: e.target.value as CityTier }))}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                    {CITY_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget Lines */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Category-wise Budget</h2>
                <button onClick={addBudgetLine} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Plus size={14} /> Add Category
                </button>
              </div>
              <div className="space-y-3">
                {budgetLines.map((line, idx) => {
                  const limit = getPolicyLimit(line.category || '');
                  const overLimit = limit && (line.estimatedAmount || 0) > limit;
                  return (
                    <div key={idx} className={`p-4 rounded-xl border transition-colors ${overLimit ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700/60 bg-slate-900/40'}`}>
                      <div className="flex items-center gap-3">
                        <select value={line.category} onChange={e => updateBudgetLine(idx, 'category', e.target.value)}
                          className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                          <input
                            type="number"
                            value={line.estimatedAmount || ''}
                            onChange={e => updateBudgetLine(idx, 'estimatedAmount', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        {limit && <span className="text-xs text-slate-500 whitespace-nowrap">Limit: ₹{limit.toLocaleString('en-IN')}</span>}
                        {overLimit && <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
                        <button onClick={() => removeBudgetLine(idx)} className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <span className="text-sm font-medium text-slate-300">Total Estimated</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">₹{totalEstimated.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Step 3: Policy Check */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Policy Compliance Check</h2>
              {!policyResult ? (
                <div className="text-center py-8">
                  <button onClick={checkPolicy} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-colors">
                    Run Policy Validation
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {policyResult.breaches.length === 0 && policyResult.warnings.length === 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 size={20} className="text-emerald-400" />
                      <div>
                        <p className="text-emerald-400 font-semibold">All within policy</p>
                        <p className="text-slate-400 text-sm">Your budget lines comply with company policy.</p>
                      </div>
                    </div>
                  )}
                  {policyResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                      <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-400 text-sm font-medium capitalize">{w.category} — Warning</p>
                        <p className="text-slate-400 text-xs mt-0.5">{w.message} · You claimed ₹{w.claimed?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                  {policyResult.breaches.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                      <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm font-medium capitalize">{b.category} — Policy Breach</p>
                        <p className="text-slate-400 text-xs mt-0.5">{b.message} · You claimed ₹{b.claimed?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                  {policyResult.breaches.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Justification for Policy Breach *</label>
                      <textarea
                        value={form.justification}
                        onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
                        rows={3}
                        placeholder="Explain why this expense exceeds policy limits..."
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Advance Request */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Advance Disbursement</h2>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Total Estimated</span>
                  <span className="font-mono font-bold text-white">₹{totalEstimated.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Max Advance (80%)</span>
                  <span className="font-mono text-cyan-400">₹{(totalEstimated * 0.8).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Advance Amount Requested</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={form.advanceRequested || ''}
                    onChange={e => setForm(f => ({ ...f, advanceRequested: Math.min(parseFloat(e.target.value) || 0, totalEstimated * 0.8) }))}
                    max={totalEstimated * 0.8}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Leave 0 if no advance needed</p>
              </div>
              {form.advanceRequested > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Disbursement Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['bank_transfer', 'corporate_card', 'wallet'] as PaymentMode[]).map(mode => (
                      <button key={mode} onClick={() => setForm(f => ({ ...f, advanceMode: mode }))}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${form.advanceMode === mode ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-slate-700/60 text-slate-400 hover:border-slate-600'}`}>
                        {mode.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Review & Submit</h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Purpose</span><span className="text-white font-medium">{form.purpose}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Route</span><span className="text-white">{form.travelFrom} → {form.travelTo}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Dates</span><span className="text-white">{form.startDate} to {form.endDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">City Tier</span><span className="text-white capitalize">{form.cityTier}</span></div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60 space-y-2">
                  {budgetLines.filter(l => (l.estimatedAmount || 0) > 0).map((l, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{l.category}</span>
                      <span className="text-white font-mono">₹{(l.estimatedAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-slate-700/60 pt-2 mt-2">
                    <span className="text-slate-300 font-medium">Total</span>
                    <span className="text-cyan-400 font-bold font-mono">₹{totalEstimated.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {form.advanceRequested > 0 && (
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Advance Requested</span>
                      <span className="text-cyan-400 font-bold font-mono">₹{form.advanceRequested.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Mode</span>
                      <span className="text-white capitalize">{form.advanceMode?.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
                {policyResult && policyResult.breaches.length > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20">
                    <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400">This claim has policy breaches and will require additional approval.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/initial-selection-screen')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all"
          >
            <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !form.purpose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.purpose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Pre-Claim <CheckCircle2 size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function PreClaimPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    }>
      <PreClaimContent />
    </Suspense>
  );
}
