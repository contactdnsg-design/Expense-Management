'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, FileQuestion, ArrowRight, CheckCircle2,
  AlertTriangle, Info, Users, Zap, Timer, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ApprovalStep {
  level: number;
  role: string;
  description: string;
  extra?: boolean;
}

interface ClaimTypeConfig {
  id: string;
  type: 'pre-claim' | 'post-claim' | 'other';
  label: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
  badgeColor: string;
  badgeLabel: string;
  useCases: string[];
  approvalFlow: ApprovalStep[];
  approvalFlowLabel: string;
  processingTime: string;
  autoPopulate: boolean;
  extraApprovalRequired: boolean;
  warningMessage?: string;
  features: string[];
  route: string;
}

const CLAIM_TYPES: ClaimTypeConfig[] = [
  {
    id: 'type-pre-claim',
    type: 'pre-claim',
    label: 'Pre-Claim',
    tagline: 'Request approval before the expense occurs',
    description: 'Submit a claim for anticipated expenses before they happen. Ideal for planned travel, conferences, and pre-approved business events. Data auto-populated from linked CRM events.',
    icon: <Calendar size={28} />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/25',
    bgColor: 'bg-cyan-500/8',
    glowColor: 'rgba(6,182,212,0.12)',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    badgeLabel: 'Auto-populated',
    route: '/claims/pre-claim',
    useCases: [
      'Planned outstation travel to client site',
      'Conference or industry event attendance',
      'Pre-approved vendor meetings requiring travel',
      'Advance hotel booking for business trips',
    ],
    approvalFlow: [
      { level: 1, role: 'Reporting Manager', description: 'First-level review and approval' },
      { level: 2, role: 'Zone Coordinator', description: 'Regional budget validation' },
      { level: 3, role: 'Sales Head', description: 'Final authorization' },
    ],
    approvalFlowLabel: 'Standard 3-Level Flow',
    processingTime: '2–4 business days',
    autoPopulate: true,
    extraApprovalRequired: false,
    features: [
      'Auto-fetch from CRM lead/opportunity',
      'Policy limits pre-validated before travel',
      'Advance payment request supported',
      'Clone from previous similar claims',
    ],
  },
  {
    id: 'type-post-claim',
    type: 'post-claim',
    label: 'Post Claim',
    tagline: 'Reimburse expenses already incurred',
    description: 'Submit a reimbursement claim for expenses you have already paid out of pocket. Receipts required for all line items. Data auto-populated from linked events where available.',
    icon: <Clock size={28} />,
    color: 'text-violet-400',
    borderColor: 'border-violet-500/25',
    bgColor: 'bg-violet-500/8',
    glowColor: 'rgba(139,92,246,0.12)',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    badgeLabel: 'Most common',
    route: '/claims/post-claim',
    useCases: [
      'Reimbursement for completed business travel',
      'Client entertainment and meal expenses',
      'Local conveyance and mileage claims',
      'Miscellaneous business purchases with receipts',
    ],
    approvalFlow: [
      { level: 1, role: 'Reporting Manager', description: 'Receipt review and first approval' },
      { level: 2, role: 'Zone Coordinator', description: 'Budget and policy validation' },
      { level: 3, role: 'Sales Head', description: 'Final approval and payment trigger' },
    ],
    approvalFlowLabel: 'Standard 3-Level Flow',
    processingTime: '3–5 business days',
    autoPopulate: true,
    extraApprovalRequired: false,
    features: [
      'Drag-and-drop receipt upload (PDF, JPG, PNG)',
      'SHA-256 duplicate receipt detection',
      'Multi-currency support (INR, USD, EUR, GBP)',
      'Expense split across multiple categories',
    ],
  },
  {
    id: 'type-other',
    type: 'other',
    label: 'Other / Exception',
    tagline: 'Special cases with extended approval chain',
    description: 'For expenses that don\'t fit standard categories — regulatory compliance costs, emergency expenditures, or cross-departmental charges. All fields require manual entry. Additional audit review required.',
    icon: <FileQuestion size={28} />,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/6',
    glowColor: 'rgba(245,158,11,0.1)',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    badgeLabel: 'Extended review',
    route: '/claims/exception',
    useCases: [
      'Regulatory compliance or legal expenses',
      'Emergency procurement without prior approval',
      'Cross-departmental or shared cost allocation',
      'Vendor refund discrepancy adjustments',
    ],
    approvalFlow: [
      { level: 1, role: 'Reporting Manager', description: 'Initial review with justification' },
      { level: 2, role: 'Zone Coordinator', description: 'Regional exception approval' },
      { level: 3, role: 'Audit Team', description: 'Compliance review — additional step', extra: true },
      { level: 4, role: 'Sales Head', description: 'Final authorization' },
    ],
    approvalFlowLabel: 'Extended 4-Level Flow',
    processingTime: '5–10 business days',
    autoPopulate: false,
    extraApprovalRequired: true,
    warningMessage: 'No auto-population — all fields require manual entry. Audit Team review adds 2–3 additional business days.',
    features: [
      'Manual entry for all fields — no CRM auto-fetch',
      'Mandatory justification text for each line item',
      'Compliance Officer notification on submission',
      'Extended audit trail with additional log entries',
    ],
  },
];

export default function ClaimTypeCards() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = (typeId: string) => {
    setSelected(typeId);
  };

  const handleProceed = async (config: ClaimTypeConfig) => {
    setLoading(config.id);
    try {
      // Check if user is authenticated
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to create a claim');
        router.push('/sign-up-login-screen');
        return;
      }

      toast.success(`${config.label} — starting claim wizard`);
      // Navigate to the correct claim flow page
      router.push(config.route);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start claim');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CLAIM_TYPES.map(config => {
          const isSelected = selected === config.id;
          const isExpanded = expandedFlow === config.id;

          return (
            <div
              key={config.id}
              onClick={() => handleSelect(config.id)}
              className={`relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden
                ${isSelected
                  ? `${config.bgColor} ${config.borderColor} scale-[1.01]`
                  : 'bg-slate-900/50 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/70'
                }`}
              style={isSelected ? { boxShadow: `0 8px 32px ${config.glowColor}, 0 1px 0 rgba(255,255,255,0.04) inset` } : {}}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(config.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${config.label} claim type`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <CheckCircle2 size={18} className={config.color} />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bgColor} border ${config.borderColor} ${config.color}`}>
                    {config.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badgeColor} mt-1`}>
                    {config.badgeLabel}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{config.label}</h3>
                <p className={`text-xs font-medium mb-3 ${config.color}`}>{config.tagline}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{config.description}</p>

                {config.warningMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 mb-4">
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400/80 leading-relaxed">{config.warningMessage}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Typical Use Cases</p>
                  <ul className="space-y-1.5">
                    {config.useCases.map((uc, i) => (
                      <li key={`usecase-${config.id}-${i}`} className="flex items-start gap-2 text-xs text-slate-400">
                        <div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${config.color.replace('text-', 'bg-')}`} />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Features</p>
                  <div className="space-y-1">
                    {config.features.map((feat, i) => (
                      <div key={`feat-${config.id}-${i}`} className="flex items-start gap-2">
                        <CheckCircle2 size={11} className={`${config.color} flex-shrink-0 mt-0.5`} />
                        <span className="text-xs text-slate-400">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-4 mb-4 py-3 border-t border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Timer size={12} />
                    <span>{config.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={12} />
                    <span>{config.approvalFlow.length} approvers</span>
                  </div>
                  {config.autoPopulate && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <Zap size={12} />
                      <span>Auto-fill</span>
                    </div>
                  )}
                </div>

                {/* Approval flow toggle */}
                <button
                  onClick={e => { e.stopPropagation(); setExpandedFlow(isExpanded ? null : config.id); }}
                  className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3 py-1"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Hide' : 'Show'} approval flow for ${config.label}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Info size={12} />
                    <span className="font-medium">{config.approvalFlowLabel}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isExpanded && (
                  <div className="mb-4 space-y-2 animate-float-up">
                    {config.approvalFlow.map(step => (
                      <div key={`step-${config.id}-${step.level}`} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${step.extra ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : `${config.bgColor} ${config.color} border ${config.borderColor}`}`}>
                          {step.level}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${step.extra ? 'text-amber-400' : 'text-slate-300'}`}>
                            {step.role}
                            {step.extra && <span className="ml-1.5 text-xs font-normal text-amber-400/70">(additional)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {isSelected && (
                  <button
                    onClick={e => { e.stopPropagation(); handleProceed(config); }}
                    disabled={loading === config.id}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                      ${config.type === 'pre-claim' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' :
                        config.type === 'post-claim' ? 'bg-violet-500 hover:bg-violet-400 text-white' :
                        'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    style={{ boxShadow: `0 0 20px ${config.glowColor}` }}
                    aria-label={`Proceed with ${config.label}`}
                  >
                    {loading === config.id ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Starting claim…
                      </>
                    ) : (
                      <>Start {config.label} <ArrowRight size={16} /></>
                    )}
                  </button>
                )}

                {!isSelected && (
                  <div className={`w-full py-2 rounded-xl text-sm font-medium text-center border transition-all ${config.borderColor} ${config.color} opacity-60 hover:opacity-100`}>
                    Click to select
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}