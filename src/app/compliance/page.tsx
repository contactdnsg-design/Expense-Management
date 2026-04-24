'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, CheckCircle, AlertTriangle, XCircle, FileText, Clock, Lock } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const complianceFrameworks = [
  { id: 'iso27001', name: 'ISO 27001', description: 'Information Security Management', status: 'compliant', score: 96, lastAudit: '2026-01-15', nextAudit: '2027-01-15', controls: 114, passed: 110 },
  { id: 'gdpr', name: 'GDPR', description: 'General Data Protection Regulation', status: 'compliant', score: 94, lastAudit: '2026-02-20', nextAudit: '2027-02-20', controls: 88, passed: 83 },
  { id: 'soc2', name: 'SOC 2 Type II', description: 'Service Organization Controls', status: 'in-progress', score: 87, lastAudit: '2025-11-10', nextAudit: '2026-11-10', controls: 64, passed: 56 },
  { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability & Accountability', status: 'compliant', score: 92, lastAudit: '2026-03-05', nextAudit: '2027-03-05', controls: 75, passed: 69 },
];

const policyAlerts = [
  { id: 'ALT-001', type: 'violation', message: 'Travel claim CLM-2026-009 exceeds ₹80,000 policy limit', severity: 'high', date: '2026-04-23' },
  { id: 'ALT-002', type: 'warning', message: 'Missing receipts for 3 meal claims submitted this week', severity: 'medium', date: '2026-04-22' },
  { id: 'ALT-003', type: 'info', message: 'MFA adoption below 75% threshold — 3 users without MFA', severity: 'medium', date: '2026-04-21' },
  { id: 'ALT-004', type: 'violation', message: 'Duplicate claim detected: CLM-2026-007 matches CLM-2026-003', severity: 'high', date: '2026-04-20' },
  { id: 'ALT-005', type: 'info', message: 'Quarterly compliance report due in 7 days', severity: 'low', date: '2026-04-19' },
];

const statusConfig = {
  compliant: { label: 'Compliant', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  'in-progress': { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  'non-compliant': { label: 'Non-Compliant', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

const alertSeverity = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  low: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: FileText },
};

export default function CompliancePage() {
  const avgScore = Math.round(complianceFrameworks.reduce((s, f) => s + f.score, 0) / complianceFrameworks.length);

  return (
    <AppLayout activeRoute="/compliance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-cyan-400" size={24} />
              Compliance Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">ISO 27001 · GDPR · SOC 2 · HIPAA compliance monitoring</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Lock size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold">Overall Score: {avgScore}%</span>
          </div>
        </div>

        {/* Framework Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {complianceFrameworks.map(fw => {
            const cfg = statusConfig[fw.status as keyof typeof statusConfig];
            const Icon = cfg.icon;
            const pct = Math.round(fw.passed / fw.controls * 100);
            return (
              <div key={fw.id} className="glass-card rounded-xl border border-slate-800/60 p-5 hover:border-slate-700/60 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-base">{fw.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{fw.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                    <Icon size={11} />{cfg.label}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Compliance Score</span>
                    <span className={`text-sm font-bold font-mono ${fw.score >= 90 ? 'text-emerald-400' : fw.score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{fw.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${fw.score >= 90 ? 'bg-emerald-500' : fw.score >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${fw.score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{fw.controls}</p>
                    <p className="text-xs text-slate-500">Controls</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{fw.passed}</p>
                    <p className="text-xs text-slate-500">Passed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-400">{fw.controls - fw.passed}</p>
                    <p className="text-xs text-slate-500">Gaps</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Last audit: {fw.lastAudit}</span>
                  <span>Next: {fw.nextAudit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Policy Alerts */}
        <div className="glass-card rounded-xl border border-slate-800/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              Policy Alerts & Violations
            </h3>
            <span className="text-xs text-slate-500">{policyAlerts.length} active alerts</span>
          </div>
          <div className="space-y-2">
            {policyAlerts.map(alert => {
              const cfg = alertSeverity[alert.severity as keyof typeof alertSeverity];
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}>
                  <Icon size={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs">{alert.message}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{alert.date}</p>
                  </div>
                  <span className={`text-xs font-medium ${cfg.color} flex-shrink-0`}>{alert.severity.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
