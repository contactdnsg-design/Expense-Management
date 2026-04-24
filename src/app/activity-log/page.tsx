'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Clock, CheckCircle, FileText, User, Shield, Settings, AlertTriangle, Search } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface ActivityEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  type: 'claim' | 'approval' | 'auth' | 'compliance' | 'settings' | 'alert';
  severity: 'info' | 'success' | 'warning' | 'error';
  ipAddress: string;
}

const activities: ActivityEntry[] = [
  { id: 'ACT-001', timestamp: '2026-04-23 17:45:12', actor: 'Sunny Singh', role: 'Member', action: 'Submitted expense claim', resource: 'Claim', resourceId: 'CLM-2026-016', type: 'claim', severity: 'info', ipAddress: '192.168.1.42' },
  { id: 'ACT-002', timestamp: '2026-04-23 17:30:05', actor: 'Admin User', role: 'Admin', action: 'Approved expense claim', resource: 'Claim', resourceId: 'CLM-2026-011', type: 'approval', severity: 'success', ipAddress: '192.168.1.10' },
  { id: 'ACT-003', timestamp: '2026-04-23 16:55:33', actor: 'Compliance Officer', role: 'Compliance', action: 'Flagged policy violation', resource: 'Claim', resourceId: 'CLM-2026-009', type: 'compliance', severity: 'warning', ipAddress: '192.168.1.55' },
  { id: 'ACT-004', timestamp: '2026-04-23 16:20:18', actor: 'Priya Sharma', role: 'Senior Engineer', action: 'Submitted expense claim', resource: 'Claim', resourceId: 'CLM-2026-015', type: 'claim', severity: 'info', ipAddress: '192.168.1.78' },
  { id: 'ACT-005', timestamp: '2026-04-23 15:48:44', actor: 'Admin User', role: 'Admin', action: 'Rejected expense claim', resource: 'Claim', resourceId: 'CLM-2026-008', type: 'approval', severity: 'error', ipAddress: '192.168.1.10' },
  { id: 'ACT-006', timestamp: '2026-04-23 15:10:22', actor: 'Owner', role: 'Owner', action: 'Updated compliance policy', resource: 'Policy', resourceId: 'POL-TRAVEL-001', type: 'settings', severity: 'info', ipAddress: '192.168.1.5' },
  { id: 'ACT-007', timestamp: '2026-04-23 14:35:09', actor: 'Rahul Mehta', role: 'Product Manager', action: 'Submitted expense claim', resource: 'Claim', resourceId: 'CLM-2026-014', type: 'claim', severity: 'info', ipAddress: '192.168.1.91' },
  { id: 'ACT-008', timestamp: '2026-04-23 14:02:55', actor: 'System', role: 'System', action: 'Auto-flagged high-value claim', resource: 'Claim', resourceId: 'CLM-2026-013', type: 'alert', severity: 'warning', ipAddress: 'system' },
  { id: 'ACT-009', timestamp: '2026-04-23 13:20:30', actor: 'Auditor', role: 'Auditor', action: 'Exported audit report', resource: 'Report', resourceId: 'RPT-Q1-2026', type: 'compliance', severity: 'info', ipAddress: '192.168.1.66' },
  { id: 'ACT-010', timestamp: '2026-04-23 12:45:17', actor: 'Admin User', role: 'Admin', action: 'Added new team member', resource: 'User', resourceId: 'USR-0042', type: 'settings', severity: 'info', ipAddress: '192.168.1.10' },
  { id: 'ACT-011', timestamp: '2026-04-23 11:30:08', actor: 'Sunny Singh', role: 'Member', action: 'Logged in successfully', resource: 'Auth', resourceId: 'SESSION-8821', type: 'auth', severity: 'success', ipAddress: '192.168.1.42' },
  { id: 'ACT-012', timestamp: '2026-04-23 10:15:44', actor: 'Unknown', role: '—', action: 'Failed login attempt', resource: 'Auth', resourceId: 'SESSION-8820', type: 'auth', severity: 'error', ipAddress: '203.0.113.45' },
];

const typeIcons = {
  claim: FileText,
  approval: CheckCircle,
  auth: User,
  compliance: Shield,
  settings: Settings,
  alert: AlertTriangle,
};

const severityConfig = {
  info: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400' },
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  error: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
};

export default function ActivityLogPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = activities.filter(a => {
    const matchSearch = a.actor.toLowerCase().includes(search.toLowerCase()) || a.action.toLowerCase().includes(search.toLowerCase()) || a.resourceId.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || a.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <AppLayout activeRoute="/activity-log">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="text-cyan-400" size={24} />
              Activity Log
            </h1>
            <p className="text-slate-400 text-sm mt-1">Complete audit trail — ISO 27001 · SOC 2 · HIPAA compliant</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium font-mono">AUDIT LOGGING ACTIVE</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by actor, action, or resource ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="claim">Claims</option>
            <option value="approval">Approvals</option>
            <option value="auth">Authentication</option>
            <option value="compliance">Compliance</option>
            <option value="settings">Settings</option>
            <option value="alert">Alerts</option>
          </select>
        </div>

        {/* Log Table */}
        <div className="glass-card rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actor</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Resource</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map(entry => {
                  const Icon = typeIcons[entry.type];
                  const sev = severityConfig[entry.severity];
                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">{entry.timestamp}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-200 font-medium text-xs">{entry.actor}</p>
                        <p className="text-slate-500 text-xs">{entry.role}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Icon size={13} className="text-slate-500 flex-shrink-0" />
                          <span className="text-slate-300 text-xs">{entry.action}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-400 text-xs">{entry.resource}</p>
                        <p className="font-mono text-xs text-cyan-400/70">{entry.resourceId}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sev.bg} ${sev.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{entry.ipAddress}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-800/60">
            <p className="text-xs text-slate-500">{filtered.length} entries shown · Logs retained for 7 years per compliance policy</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
