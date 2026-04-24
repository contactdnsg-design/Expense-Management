'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { exceptionClaimService } from '@/lib/services/claimService';
import type { ExceptionType, ClaimCategory } from '@/lib/types/claims';
import { ArrowLeft, AlertTriangle, CheckCircle2, Loader2, Zap, Receipt, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ExceptionTypeConfig {
  type: ExceptionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  fields: string[];
}

const EXCEPTION_TYPES: ExceptionTypeConfig[] = [
  {
    type: 'no_pre_approval',
    label: 'No Pre-Approval',
    description: 'Emergency travel or urgent purchase without prior approval',
    icon: <Zap size={20} />,
    color: 'text-red-400', borderColor: 'border-red-500/30', bgColor: 'bg-red-500/8',
    fields: ['purpose', 'justification', 'amount', 'category'],
  },
  {
    type: 'policy_violation',
    label: 'Policy Violation',
    description: 'Business class travel, over-budget hotel, or other policy breach',
    icon: <AlertTriangle size={20} />,
    color: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/8',
    fields: ['purpose', 'justification', 'amount', 'category'],
  },
  {
    type: 'lost_bill',
    label: 'Lost Bill',
    description: 'Expense incurred but receipt/bill is unavailable',
    icon: <Receipt size={20} />,
    color: 'text-orange-400', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/8',
    fields: ['purpose', 'justification', 'amount', 'category', 'no_bill_declaration'],
  },
  {
    type: 'per_diem',
    label: 'Per Diem',
    description: 'Fixed daily allowance based on location and grade',
    icon: <Clock size={20} />,
    color: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/8',
    fields: ['per_diem_location', 'per_diem_days', 'per_diem_rate'],
  },
  {
    type: 'recurring',
    label: 'Recurring Claim',
    description: 'Monthly internet, mobile, or other recurring reimbursements',
    icon: <RefreshCw size={20} />,
    color: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/8',
    fields: ['purpose', 'amount', 'category', 'recurring_month'],
  },
  {
    type: 'corporate_card_reconciliation',
    label: 'Corporate Card',
    description: 'Reconcile corporate card transactions with claims',
    icon: <CreditCard size={20} />,
    color: 'text-violet-400', borderColor: 'border-violet-500/30', bgColor: 'bg-violet-500/8',
    fields: ['purpose', 'amount', 'corporate_card_last4'],
  },
];

const CATEGORIES: ClaimCategory[] = ['travel', 'hotel', 'food', 'transport', 'misc', 'entertainment', 'medical', 'software', 'training', 'internet', 'mobile'];

export default function ExceptionClaimPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ExceptionTypeConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    purpose: '', justification: '', amount: 0, category: 'misc' as ClaimCategory,
    noBillDeclaration: false, perDiemLocation: '', perDiemDays: 0, perDiemRate: 0,
    recurringMonth: '', corporateCardLast4: '',
  });

  const perDiemTotal = form.perDiemDays * form.perDiemRate;

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const claim = await exceptionClaimService.create({
        exceptionType: selectedType.type,
        purpose: form.purpose || selectedType.label,
        justification: form.justification,
        amount: selectedType.type === 'per_diem' ? perDiemTotal : form.amount,
        category: form.category,
        noBillDeclaration: form.noBillDeclaration,
        perDiemLocation: form.perDiemLocation,
        perDiemDays: form.perDiemDays,
        perDiemRate: form.perDiemRate,
        recurringMonth: form.recurringMonth,
        corporateCardLast4: form.corporateCardLast4,
      });
      if (!claim) throw new Error('Failed to create exception claim');
      toast.success(`Exception Claim ${claim.claimNumber} submitted — flagged for review`);
      setTimeout(() => router.push('/my-claims'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const hasField = (field: string) => selectedType?.fields.includes(field);

  return (
    <AppLayout activeRoute="/initial-selection-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => selectedType ? setSelectedType(null) : router.push('/initial-selection-screen')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Exception / Other Claim</h1>
            <p className="text-slate-400 text-sm">Special cases with extended approval chain</p>
          </div>
        </div>

        {/* Policy Deviation Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-sm font-medium">Policy Deviation Flag</p>
            <p className="text-slate-400 text-xs mt-0.5">All exception claims are auto-flagged and routed through extended approval. Processing takes 5–10 business days.</p>
          </div>
        </div>

        {!selectedType ? (
          /* Type Selection */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EXCEPTION_TYPES.map(config => (
              <button key={config.type} onClick={() => setSelectedType(config)}
                className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] ${config.bgColor} ${config.borderColor} hover:border-opacity-60`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgColor} border ${config.borderColor} ${config.color} mb-3`}>
                  {config.icon}
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${config.color}`}>{config.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{config.description}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Claim Form */
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 space-y-5">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedType.bgColor} border ${selectedType.borderColor}`}>
              <span className={selectedType.color}>{selectedType.icon}</span>
              <div>
                <p className={`font-semibold text-sm ${selectedType.color}`}>{selectedType.label}</p>
                <p className="text-xs text-slate-400">{selectedType.description}</p>
              </div>
            </div>

            {hasField('purpose') && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Purpose *</label>
                <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="Brief description of the expense"
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            )}

            {hasField('justification') && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Justification *</label>
                <textarea value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
                  rows={4} placeholder="Explain why this exception is necessary. Be specific about business need and circumstances."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            )}

            {hasField('amount') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹) *</label>
                  <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
                </div>
                {hasField('category') && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ClaimCategory }))}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {hasField('no_bill_declaration') && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/8 border border-orange-500/20">
                <input type="checkbox" id="no_bill" checked={form.noBillDeclaration} onChange={e => setForm(f => ({ ...f, noBillDeclaration: e.target.checked }))}
                  className="mt-0.5 accent-orange-500" />
                <label htmlFor="no_bill" className="text-sm text-orange-300 cursor-pointer">
                  I declare that the bill/receipt is unavailable. I understand this claim is subject to additional scrutiny and frequency monitoring.
                </label>
              </div>
            )}

            {hasField('per_diem_location') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                  <input value={form.perDiemLocation} onChange={e => setForm(f => ({ ...f, perDiemLocation: e.target.value }))}
                    placeholder="City / Location"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Days</label>
                    <input type="number" value={form.perDiemDays || ''} onChange={e => setForm(f => ({ ...f, perDiemDays: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Daily Rate (₹)</label>
                    <input type="number" value={form.perDiemRate || ''} onChange={e => setForm(f => ({ ...f, perDiemRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="800"
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>
                {perDiemTotal > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/8 border border-blue-500/20">
                    <span className="text-sm text-slate-400">Total Per Diem</span>
                    <span className="text-blue-400 font-bold font-mono">₹{perDiemTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}

            {hasField('recurring_month') && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Month</label>
                <input type="month" value={form.recurringMonth} onChange={e => setForm(f => ({ ...f, recurringMonth: e.target.value }))}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            )}

            {hasField('corporate_card_last4') && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Last 4 Digits</label>
                <input value={form.corporateCardLast4} onChange={e => setForm(f => ({ ...f, corporateCardLast4: e.target.value.slice(0, 4) }))}
                  placeholder="1234" maxLength={4}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setSelectedType(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white text-sm font-medium transition-all">
                Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${selectedType.bgColor} ${selectedType.color} border ${selectedType.borderColor} hover:opacity-90`}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Exception Claim <CheckCircle2 size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
