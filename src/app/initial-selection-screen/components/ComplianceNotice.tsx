import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function ComplianceNotice() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-xs">
      <Shield size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-cyan-400">PHI Notice: </span>
        <span className="text-slate-400">
          All expense claim data submitted through ClaimFlow is treated as Protected Health Information (PHI) under HIPAA.
          Data is encrypted at rest and in transit. Access is tenant-scoped via Row-Level Security.
          By proceeding, you acknowledge the data handling policy.
        </span>
        <span className="ml-2 inline-flex items-center gap-1 text-emerald-400/80">
          <Lock size={10} /> End-to-end encrypted
        </span>
      </div>
    </div>
  );
}