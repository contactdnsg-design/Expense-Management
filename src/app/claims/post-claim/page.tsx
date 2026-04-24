'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { postClaimService, expenseItemService, preClaimService } from '@/lib/services/claimService';

import type { ClaimCategory, CityTier } from '@/lib/types/claims';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Plus, Trash2, Upload, Loader2, ChevronRight, Camera, FileText, DollarSign, Building2, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Claim Details', icon: <FileText size={16} /> },
  { id: 2, label: 'Expense Entry', icon: <DollarSign size={16} /> },
  { id: 3, label: 'Auto-Match', icon: <TrendingUp size={16} /> },
  { id: 4, label: 'Policy Check', icon: <CheckCircle2 size={16} /> },
  { id: 5, label: 'Settlement', icon: <Building2 size={16} /> },
  { id: 6, label: 'Review & Submit', icon: <Upload size={16} /> },
];

const CATEGORIES: ClaimCategory[] = ['travel', 'hotel', 'food', 'transport', 'misc', 'entertainment', 'medical', 'software', 'training'];

const POLICY_LIMITS: Record<string, Record<string, number>> = {
  tier1: { hotel: 8000, food: 1200, travel: 20000, transport: 1500, misc: 2000 },
  tier2: { hotel: 5000, food: 800, travel: 15000, transport: 1000, misc: 1500 },
  tier3: { hotel: 3000, food: 600, travel: 10000, transport: 800, misc: 1000 },
  international: { hotel: 15000, food: 3000, travel: 80000, transport: 3000, misc: 5000 },
};

interface ExpenseFormItem {
  category: ClaimCategory;
  vendorName: string;
  billDate: string;
  billNumber: string;
  amount: number;
  gstAmount: number;
  currency: string;
  notes: string;
}

function PostClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preClaimId = searchParams?.get('pre_claim_id');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [preClaim, setPreClaim] = useState<any>(null);

  const [form, setForm] = useState({
    purpose: '', description: '', travelFrom: '', travelTo: '',
    startDate: '', endDate: '', cityTier: 'tier2' as CityTier,
    advanceTaken: 0,
  });

  const [expenseItems, setExpenseItems] = useState<ExpenseFormItem[]>([
    { category: 'travel', vendorName: '', billDate: '', billNumber: '', amount: 0, gstAmount: 0, currency: 'INR', notes: '' },
  ]);

  const [policyViolations, setPolicyViolations] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<{ type: string; amount: number } | null>(null);

  useEffect(() => {
    if (preClaimId) {
      preClaimService.getById(preClaimId).then(pc => {
        if (pc) {
          setPreClaim(pc);
          setForm(f => ({
            ...f,
            purpose: pc.purpose,
            description: pc.description,
            travelFrom: pc.travelFrom,
            travelTo: pc.travelTo,
            startDate: pc.startDate || '',
            endDate: pc.endDate || '',
            cityTier: pc.cityTier,
            advanceTaken: pc.advanceSanctioned,
          }));
        }
      });
    }
  }, [preClaimId]);

  const totalClaimed = expenseItems.reduce((s, i) => s + (i.amount || 0), 0);

  const runPolicyCheck = () => {
    const violations: any[] = [];
    expenseItems.forEach(item => {
      const limit = POLICY_LIMITS[form.cityTier]?.[item.category];
      if (limit && item.amount > limit) {
        violations.push({ category: item.category, vendor: item.vendorName, amount: item.amount, limit, message: `Exceeds ${item.category} limit of ₹${limit.toLocaleString('en-IN')}` });
      }
    });
    setPolicyViolations(violations);
  };

  const calculateSettlement = () => {
    const diff = totalClaimed - form.advanceTaken;
    if (diff > 0) setSettlement({ type: 'reimbursement', amount: diff });
    else if (diff < 0) setSettlement({ type: 'recovery', amount: Math.abs(diff) });
    else setSettlement({ type: 'exact_match', amount: 0 });
  };

  const handleNext = () => {
    if (step === 3) runPolicyCheck();
    if (step === 4) calculateSettlement();
    if (step < 6) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const claim = await postClaimService.create({
        ...form,
        preClaimId: preClaimId || undefined,
      });
      if (!claim) throw new Error('Failed to create claim');

      for (const item of expenseItems.filter(i => i.amount > 0)) {
        await expenseItemService.addItem({ ...item, postClaimId: claim.id });
      }

      await postClaimService.submit(claim.id);
      toast.success(`Post-Claim ${claim.claimNumber} submitted for approval!`);
      setTimeout(() => router.push('/my-claims'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { category: 'misc', vendorName: '', billDate: '', billNumber: '', amount: 0, gstAmount: 0, currency: 'INR', notes: '' }]);
  };

  const removeExpenseItem = (idx: number) => setExpenseItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: string, value: any) => {
    setExpenseItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  return (
    <AppLayout activeRoute="/initial-selection-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/initial-selection-screen')} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">New Post-Claim</h1>
            <p className="text-slate-400 text-sm">{preClaim ? `Settling advance from ${preClaim.claimNumber}` : 'Submit actual expenses for reimbursement'}</p>
          </div>
        </div>

        {preClaim && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/8 border border-violet-500/20">
            <CheckCircle2 size={16} className="text-violet-400" />
            <p className="text-sm text-violet-300">Linked to Pre-Claim <span className="font-mono font-bold">{preClaim.claimNumber}</span> · Advance: ₹{preClaim.advanceSanctioned?.toLocaleString('en-IN')}</p>
          </div>
        )}

        <div className="glass-card rounded-2xl border border-slate-800/60 p-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    step === s.id ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                    step > s.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer': 'text-slate-500 border border-transparent'
                  }`}>
                  {step > s.id ? <CheckCircle2 size={12} /> : s.icon}
                  <span>{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Claim Details</h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Purpose *</label>
                <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="e.g. Mumbai client visit settlement"
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">From</label>
                  <input value={form.travelFrom} onChange={e => setForm(f => ({ ...f, travelFrom: e.target.value }))} placeholder="Bangalore"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">To</label>
                  <input value={form.travelTo} onChange={e => setForm(f => ({ ...f, travelTo: e.target.value }))} placeholder="Mumbai"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">City Tier</label>
                  <select value={form.cityTier} onChange={e => setForm(f => ({ ...f, cityTier: e.target.value as CityTier }))}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50">
                    <option value="tier1">Tier 1 (Metro)</option>
                    <option value="tier2">Tier 2 (Major City)</option>
                    <option value="tier3">Tier 3 (Small City)</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Advance Taken (₹)</label>
                  <input type="number" value={form.advanceTaken || ''} onChange={e => setForm(f => ({ ...f, advanceTaken: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Expense Entry</h2>
                <button onClick={addExpenseItem} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  <Plus size={14} /> Add Expense
                </button>
              </div>
              <div className="space-y-4">
                {expenseItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                      <button onClick={() => removeExpenseItem(idx)} className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Vendor Name</label>
                        <input value={item.vendorName} onChange={e => updateItem(idx, 'vendorName', e.target.value)} placeholder="Vendor / Merchant"
                          className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Bill Date</label>
                        <input type="date" value={item.billDate} onChange={e => updateItem(idx, 'billDate', e.target.value)}
                          className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Bill No.</label>
                        <input value={item.billNumber} onChange={e => updateItem(idx, 'billNumber', e.target.value)} placeholder="INV-001"
                          className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Amount (₹)</label>
                        <input type="number" value={item.amount || ''} onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)} placeholder="0"
                          className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">GST (₹)</label>
                        <input type="number" value={item.gstAmount || ''} onChange={e => updateItem(idx, 'gstAmount', parseFloat(e.target.value) || 0)} placeholder="0"
                          className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors px-2 py-1 rounded border border-slate-700/40 hover:border-violet-500/30">
                        <Camera size={12} /> Scan Bill (OCR)
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors px-2 py-1 rounded border border-slate-700/40 hover:border-violet-500/30">
                        <Upload size={12} /> Upload Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <span className="text-sm font-medium text-slate-300">Total Claimed</span>
                <span className="text-lg font-bold text-violet-400 font-mono">₹{totalClaimed.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Auto-Matching Engine</h2>
              {preClaim ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                      <p className="text-xs text-slate-500 mb-1">Estimated</p>
                      <p className="text-lg font-bold text-white font-mono">₹{preClaim.estimatedTotal?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                      <p className="text-xs text-slate-500 mb-1">Actual</p>
                      <p className="text-lg font-bold text-violet-400 font-mono">₹{totalClaimed.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`p-4 rounded-xl border text-center ${totalClaimed > preClaim.estimatedTotal ? 'bg-red-500/8 border-red-500/20' : 'bg-emerald-500/8 border-emerald-500/20'}`}>
                      <p className="text-xs text-slate-500 mb-1">{totalClaimed > preClaim.estimatedTotal ? 'Excess Spend' : 'Savings'}</p>
                      <p className={`text-lg font-bold font-mono ${totalClaimed > preClaim.estimatedTotal ? 'text-red-400' : 'text-emerald-400'}`}>
                        ₹{Math.abs(totalClaimed - preClaim.estimatedTotal).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                  <Info size={32} className="text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No pre-claim linked. This is a fresh claim.</p>
                  <p className="text-slate-500 text-xs mt-1">Total claimed: ₹{totalClaimed.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Policy Compliance Check</h2>
              {policyViolations.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-semibold">All expenses within policy</p>
                    <p className="text-slate-400 text-sm">No policy violations detected.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {policyViolations.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                      <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm font-medium capitalize">{v.category} — {v.vendor}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{v.message} · Claimed: ₹{v.amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Settlement Calculation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60">
                  <p className="text-xs text-slate-500 mb-1">Total Claimed</p>
                  <p className="text-xl font-bold text-white font-mono">₹{totalClaimed.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60">
                  <p className="text-xs text-slate-500 mb-1">Advance Taken</p>
                  <p className="text-xl font-bold text-cyan-400 font-mono">₹{form.advanceTaken.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {settlement && (
                <div className={`p-5 rounded-xl border ${
                  settlement.type === 'reimbursement' ? 'bg-emerald-500/8 border-emerald-500/20' :
                  settlement.type === 'recovery'? 'bg-red-500/8 border-red-500/20' : 'bg-slate-900/40 border-slate-700/60'
                }`}>
                  <div className="flex items-center gap-3">
                    {settlement.type === 'reimbursement' ? <TrendingUp size={24} className="text-emerald-400" /> :
                     settlement.type === 'recovery' ? <TrendingDown size={24} className="text-red-400" /> :
                     <Minus size={24} className="text-slate-400" />}
                    <div>
                      <p className={`font-bold text-lg ${settlement.type === 'reimbursement' ? 'text-emerald-400' : settlement.type === 'recovery' ? 'text-red-400' : 'text-slate-300'}`}>
                        {settlement.type === 'reimbursement' ? 'Reimbursement Due to You' :
                         settlement.type === 'recovery'? 'Amount to Return to Company' : 'Exact Match — No Settlement Needed'}
                      </p>
                      {settlement.amount > 0 && <p className="text-2xl font-bold font-mono mt-1 text-white">₹{settlement.amount.toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Review & Submit</h2>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Purpose</span><span className="text-white">{form.purpose}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Route</span><span className="text-white">{form.travelFrom} → {form.travelTo}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Expenses</span><span className="text-white">{expenseItems.filter(e => e.amount > 0).length} items</span></div>
                <div className="flex justify-between text-sm border-t border-slate-700/60 pt-2">
                  <span className="text-slate-300 font-medium">Total Claimed</span>
                  <span className="text-violet-400 font-bold font-mono">₹{totalClaimed.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/initial-selection-screen')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all">
            <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          {step < 6 ? (
            <button onClick={handleNext} disabled={step === 1 && !form.purpose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm transition-all disabled:opacity-50">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting || !form.purpose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm transition-all disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Post-Claim <CheckCircle2 size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function PostClaimPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    }>
      <PostClaimContent />
    </Suspense>
  );
}
