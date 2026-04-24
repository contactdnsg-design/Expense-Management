'use client';
import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Upload, MessageSquare,
  AlertTriangle, Send, Clock, RefreshCw, ChevronDown
} from 'lucide-react';

type ActivityType = 'approved' | 'rejected' | 'submitted' | 'comment' | 'violation' | 'reimbursed' | 'hold' | 'uploaded';

interface ActivityItem {
  id: string;
  type: ActivityType;
  user: string;
  userId: string;
  role: string;
  claimNo: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

// Backend integration point: fetch from /api/activity-log?tenant_id=...&limit=20
const ACTIVITIES: ActivityItem[] = [
  { id: 'act-001', type: 'approved', user: 'Rajan Verma', userId: 'E10021', role: 'Zone Coordinator', claimNo: 'CF-2026-0847', description: 'Approved at Level 2 — within policy', timestamp: '23-04-2026 17:42', timeAgo: '13 min ago' },
  { id: 'act-002', type: 'violation', user: 'System', userId: 'SYS', role: 'Automation', claimNo: 'CF-2026-0845', description: 'Policy violation detected — ₹52,000 exceeds ₹40,000 travel limit. Routed to Audit Team.', timestamp: '23-04-2026 17:30', timeAgo: '25 min ago' },
  { id: 'act-003', type: 'submitted', user: 'Priya Mehta', userId: 'E10923', role: 'Member', claimNo: 'CF-2026-0846', description: 'Submitted post-claim for hotel stay at Taj Palace, Mumbai', timestamp: '23-04-2026 16:58', timeAgo: '57 min ago' },
  { id: 'act-004', type: 'comment', user: 'Amit Saxena', userId: 'E10089', role: 'Reporting Manager', claimNo: 'CF-2026-0843', description: 'Requested additional documentation — original hotel invoice required', timestamp: '23-04-2026 16:15', timeAgo: '1h 40m ago' },
  { id: 'act-005', type: 'uploaded', user: 'Rohit Sharma', userId: 'E10756', role: 'Member', claimNo: 'CF-2026-0843', description: 'Uploaded 2 receipts — hotel_invoice_apr23.pdf, taxi_receipt.jpg', timestamp: '23-04-2026 15:44', timeAgo: '2h 11m ago' },
  { id: 'act-006', type: 'reimbursed', user: 'Finance Team', userId: 'E10002', role: 'Finance', claimNo: 'CF-2026-0842', description: 'Reimbursed ₹6,800 via NEFT — UTR: HDFC2026042301847', timestamp: '23-04-2026 14:30', timeAgo: '3h 25m ago' },
  { id: 'act-007', type: 'rejected', user: 'Sunita Patel', userId: 'E10034', role: 'Sales Head', claimNo: 'CF-2026-0840', description: 'Rejected — claimed amount ₹31,000 exceeds sanctioned ₹28,000 with insufficient justification', timestamp: '23-04-2026 12:18', timeAgo: '5h 37m ago' },
  { id: 'act-008', type: 'hold', user: 'Compliance Team', userId: 'E10015', role: 'Compliance Officer', claimNo: 'CF-2026-0843', description: 'Placed on hold — pending GSTIN verification for vendor Wipro Ltd.', timestamp: '23-04-2026 11:05', timeAgo: '6h 50m ago' },
];

const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string }> = {
  approved: { icon: <CheckCircle2 size={14} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  submitted: { icon: <Send size={14} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  comment: { icon: <MessageSquare size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  violation: { icon: <AlertTriangle size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  reimbursed: { icon: <CheckCircle2 size={14} />, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  hold: { icon: <Clock size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  uploaded: { icon: <Upload size={14} />, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? ACTIVITIES : ACTIVITIES.slice(0, 5);

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-base font-semibold text-white">Activity Thread</h3>
          <p className="text-xs text-slate-500 mt-0.5">Immutable audit log · PHI-encrypted</p>
        </div>
        <button className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Refresh activity feed">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        {displayed.map((item, index) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <div key={item.id} className="flex gap-3 group">
              {/* Timeline line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
                  {config.icon}
                </div>
                {index < displayed.length - 1 && (
                  <div className="w-px flex-1 bg-slate-800/60 mt-1 min-h-[12px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-3 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-200">{item.user}</span>
                    <span className="text-xs text-slate-600 ml-1.5">· {item.role}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-mono flex-shrink-0 whitespace-nowrap">{item.timeAgo}</span>
                </div>
                <p className="text-xs font-mono text-cyan-500/70 mb-1">{item.claimNo}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {!showAll && ACTIVITIES.length > 5 && (
        <div className="border-t border-slate-800/60 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setShowAll(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors py-1"
          >
            <ChevronDown size={13} />
            Show {ACTIVITIES.length - 5} more entries
          </button>
        </div>
      )}
    </div>
  );
}