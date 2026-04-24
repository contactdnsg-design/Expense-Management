'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus, Search, Shield, Crown, UserCheck, Eye, MoreVertical, Mail, CheckCircle, XCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Auditor' | 'Compliance Officer';
  department: string;
  employeeId: string;
  status: 'active' | 'inactive';
  mfaEnabled: boolean;
  lastActive: string;
  claimsCount: number;
}

const members: TeamMember[] = [
  { id: 'USR-001', name: 'Owner Admin', email: 'owner@dnsgventures.in', role: 'Owner', department: 'Executive', employeeId: 'E00001', status: 'active', mfaEnabled: true, lastActive: '2026-04-23', claimsCount: 12 },
  { id: 'USR-002', name: 'Admin User', email: 'admin@dnsgventures.in', role: 'Admin', department: 'Finance', employeeId: 'E00002', status: 'active', mfaEnabled: true, lastActive: '2026-04-23', claimsCount: 8 },
  { id: 'USR-003', name: 'Sunny Singh', email: 'sunny.singh@dnsgventures.in', role: 'Member', department: 'Engineering', employeeId: 'E12345', status: 'active', mfaEnabled: false, lastActive: '2026-04-23', claimsCount: 24 },
  { id: 'USR-004', name: 'Auditor', email: 'auditor@dnsgventures.in', role: 'Auditor', department: 'Audit & Risk', employeeId: 'E00004', status: 'active', mfaEnabled: true, lastActive: '2026-04-22', claimsCount: 0 },
  { id: 'USR-005', name: 'Compliance Officer', email: 'compliance@dnsgventures.in', role: 'Compliance Officer', department: 'Legal & Compliance', employeeId: 'E00005', status: 'active', mfaEnabled: true, lastActive: '2026-04-22', claimsCount: 2 },
  { id: 'USR-006', name: 'Priya Sharma', email: 'priya.sharma@dnsgventures.in', role: 'Member', department: 'Engineering', employeeId: 'E12346', status: 'active', mfaEnabled: false, lastActive: '2026-04-21', claimsCount: 18 },
  { id: 'USR-007', name: 'Rahul Mehta', email: 'rahul.mehta@dnsgventures.in', role: 'Member', department: 'Product', employeeId: 'E12347', status: 'active', mfaEnabled: true, lastActive: '2026-04-20', claimsCount: 15 },
  { id: 'USR-008', name: 'Anita Desai', email: 'anita.desai@dnsgventures.in', role: 'Member', department: 'Design', employeeId: 'E12348', status: 'inactive', mfaEnabled: false, lastActive: '2026-04-10', claimsCount: 7 },
];

const roleConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  'Owner': { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Crown size={11} /> },
  'Admin': { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: <Shield size={11} /> },
  'Member': { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: <UserCheck size={11} /> },
  'Auditor': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <Eye size={11} /> },
  'Compliance Officer': { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Shield size={11} /> },
};

export default function TeamMembersPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppLayout activeRoute="/team-members">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-cyan-400" size={24} />
              Team Members
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage users, roles, and access permissions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold rounded-lg transition-colors text-sm">
            <Plus size={16} />
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Members</p>
            <p className="text-2xl font-bold text-white mt-1">{members.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Active</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{members.filter(m => m.status === 'active').length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">MFA Enabled</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{members.filter(m => m.mfaEnabled).length}</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">MFA Coverage</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{Math.round(members.filter(m => m.mfaEnabled).length / members.length * 100)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Auditor">Auditor</option>
            <option value="Compliance Officer">Compliance Officer</option>
          </select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Member</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">MFA</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Active</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Claims</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map(member => {
                  const rCfg = roleConfig[member.role];
                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium text-xs">{member.name}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1"><Mail size={10} />{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${rCfg.bg} ${rCfg.color}`}>
                          {rCfg.icon}{member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{member.department}</td>
                      <td className="px-5 py-4">
                        {member.mfaEnabled
                          ? <CheckCircle size={15} className="text-emerald-400" />
                          : <XCircle size={15} className="text-slate-600" />}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${member.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{member.lastActive}</td>
                      <td className="px-5 py-4 text-slate-300 text-xs font-mono">{member.claimsCount}</td>
                      <td className="px-5 py-4">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-800/60">
            <p className="text-xs text-slate-500">{filtered.length} members shown</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
