'use client';
import React, { useState } from 'react';
import { Search, Filter, Eye, Edit3, Copy, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

type ClaimStatus = 'draft' | 'submitted' | 'under_approval' | 'approved' | 'rejected' | 'hold' | 'reimbursed';

interface Claim {
  id: string;
  claimNo: string;
  employeeName: string;
  employeeId: string;
  department: string;
  claimType: 'pre-claim' | 'post-claim' | 'other';
  expenseType: string;
  expenseDate: string;
  partyName: string;
  claimedAmount: number;
  sanctionedAmount: number | null;
  currency: string;
  status: ClaimStatus;
  submittedDate: string;
  approvalLevel: number;
  totalLevels: number;
  policyViolation: boolean;
}

// Backend integration point: fetch from /api/claims?tenant_id=...&page=...&filters=...
const CLAIMS: Claim[] = [
  { id: 'claim-001', claimNo: 'CF-2026-0847', employeeName: 'Sunny Singh', employeeId: 'E12345', department: 'Sales', claimType: 'post-claim', expenseType: 'Travel', expenseDate: '18-04-2026', partyName: 'Reliance Industries', claimedAmount: 24500, sanctionedAmount: null, currency: 'INR', status: 'under_approval', submittedDate: '20-04-2026', approvalLevel: 2, totalLevels: 3, policyViolation: false },
  { id: 'claim-002', claimNo: 'CF-2026-0846', employeeName: 'Priya Mehta', employeeId: 'E10923', department: 'Marketing', claimType: 'post-claim', expenseType: 'Hotel', expenseDate: '15-04-2026', partyName: 'Tata Consultancy', claimedAmount: 18750, sanctionedAmount: null, currency: 'INR', status: 'submitted', submittedDate: '19-04-2026', approvalLevel: 1, totalLevels: 3, policyViolation: false },
  { id: 'claim-003', claimNo: 'CF-2026-0845', employeeName: 'Arjun Kapoor', employeeId: 'E10841', department: 'Finance', claimType: 'pre-claim', expenseType: 'Travel', expenseDate: '22-04-2026', partyName: 'Infosys Ltd.', claimedAmount: 52000, sanctionedAmount: null, currency: 'INR', status: 'under_approval', submittedDate: '18-04-2026', approvalLevel: 3, totalLevels: 4, policyViolation: true },
  { id: 'claim-004', claimNo: 'CF-2026-0844', employeeName: 'Deepika Nair', employeeId: 'E11204', department: 'Sales', claimType: 'post-claim', expenseType: 'Meals', expenseDate: '14-04-2026', partyName: 'HCL Technologies', claimedAmount: 8400, sanctionedAmount: 8400, currency: 'INR', status: 'approved', submittedDate: '16-04-2026', approvalLevel: 3, totalLevels: 3, policyViolation: false },
  { id: 'claim-005', claimNo: 'CF-2026-0843', employeeName: 'Rohit Sharma', employeeId: 'E10756', department: 'Sales', claimType: 'other', expenseType: 'Misc', expenseDate: '12-04-2026', partyName: 'Wipro Ltd.', claimedAmount: 15200, sanctionedAmount: null, currency: 'INR', status: 'hold', submittedDate: '14-04-2026', approvalLevel: 2, totalLevels: 4, policyViolation: true },
  { id: 'claim-006', claimNo: 'CF-2026-0842', employeeName: 'Kavita Reddy', employeeId: 'E11502', department: 'Marketing', claimType: 'post-claim', expenseType: 'Per Diem', expenseDate: '10-04-2026', partyName: 'Bajaj Finserv', claimedAmount: 6800, sanctionedAmount: 6800, currency: 'INR', status: 'reimbursed', submittedDate: '12-04-2026', approvalLevel: 3, totalLevels: 3, policyViolation: false },
  { id: 'claim-007', claimNo: 'CF-2026-0841', employeeName: 'Vikram Joshi', employeeId: 'E10634', department: 'Finance', claimType: 'post-claim', expenseType: 'Mileage', expenseDate: '09-04-2026', partyName: 'HDFC Bank', claimedAmount: 3250, sanctionedAmount: 3250, currency: 'INR', status: 'reimbursed', submittedDate: '11-04-2026', approvalLevel: 3, totalLevels: 3, policyViolation: false },
  { id: 'claim-008', claimNo: 'CF-2026-0840', employeeName: 'Ananya Iyer', employeeId: 'E11891', department: 'Sales', claimType: 'post-claim', expenseType: 'Travel', expenseDate: '08-04-2026', partyName: 'Adani Group', claimedAmount: 31000, sanctionedAmount: 28000, currency: 'INR', status: 'rejected', submittedDate: '10-04-2026', approvalLevel: 2, totalLevels: 3, policyViolation: false },
  { id: 'claim-009', claimNo: 'CF-2026-0839', employeeName: 'Kiran Malhotra', employeeId: 'E10312', department: 'Marketing', claimType: 'pre-claim', expenseType: 'Hotel', expenseDate: '25-04-2026', partyName: 'Mahindra & Mahindra', claimedAmount: 22000, sanctionedAmount: null, currency: 'INR', status: 'draft', submittedDate: '—', approvalLevel: 0, totalLevels: 3, policyViolation: false },
  { id: 'claim-010', claimNo: 'CF-2026-0838', employeeName: 'Sanjay Gupta', employeeId: 'E10198', department: 'Finance', claimType: 'post-claim', expenseType: 'Meals', expenseDate: '07-04-2026', partyName: 'Sun Pharma', claimedAmount: 4600, sanctionedAmount: 4600, currency: 'INR', status: 'reimbursed', submittedDate: '09-04-2026', approvalLevel: 3, totalLevels: 3, policyViolation: false },
  { id: 'claim-011', claimNo: 'CF-2026-0837', employeeName: 'Meena Pillai', employeeId: 'E11340', department: 'Sales', claimType: 'post-claim', expenseType: 'Travel', expenseDate: '06-04-2026', partyName: 'L&T Finance', claimedAmount: 19800, sanctionedAmount: null, currency: 'INR', status: 'submitted', submittedDate: '08-04-2026', approvalLevel: 1, totalLevels: 3, policyViolation: false },
  { id: 'claim-012', claimNo: 'CF-2026-0836', employeeName: 'Rahul Desai', employeeId: 'E10445', department: 'Marketing', claimType: 'other', expenseType: 'Misc', expenseDate: '05-04-2026', partyName: 'Zomato Ltd.', claimedAmount: 9200, sanctionedAmount: null, currency: 'INR', status: 'under_approval', submittedDate: '07-04-2026', approvalLevel: 2, totalLevels: 4, policyViolation: false },
];

const STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_approval: 'Under Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  hold: 'On Hold',
  reimbursed: 'Reimbursed',
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  return <span className={`status-${status}`}>{STATUS_LABELS[status]}</span>;
}

function ApprovalProgress({ level, total }: { level: number; total: number }) {
  if (level === 0) return <span className="text-xs text-slate-600">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={`prog-${i}`}
            className={`h-1.5 w-4 rounded-full ${i < level ? 'bg-cyan-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>
      <span className="text-xs font-mono text-slate-500">{level}/{total}</span>
    </div>
  );
}

type SortField = 'claimNo' | 'employeeName' | 'claimedAmount' | 'submittedDate' | 'status';

export default function ClaimsTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('submittedDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = CLAIMS.filter(c => {
    const matchSearch = search === '' || 
      c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.partyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchDept = deptFilter === 'all' || c.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'claimedAmount') cmp = a.claimedAmount - b.claimedAmount;
    else if (sortField === 'claimNo') cmp = a.claimNo.localeCompare(b.claimNo);
    else if (sortField === 'employeeName') cmp = a.employeeName.localeCompare(b.employeeName);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else cmp = a.submittedDate.localeCompare(b.submittedDate);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(paginated.map(c => c.id)));
  };

  const handleBulkDelete = () => {
    toast.success(`${selectedRows.size} claims deleted`);
    setSelectedRows(new Set());
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp size={10} className={sortField === field && sortDir === 'asc' ? 'text-cyan-400' : 'text-slate-700'} />
      <ChevronDown size={10} className={sortField === field && sortDir === 'desc' ? 'text-cyan-400' : 'text-slate-700'} />
    </span>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-slate-800/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">All Claims</h3>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} records · Tenant-scoped · RLS enforced</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search claims…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-8 pr-3 py-1.5 text-xs h-8 w-48"
              aria-label="Search claims"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as ClaimStatus | 'all'); setPage(1); }}
            className="input-field text-xs h-8 py-0 px-3 cursor-pointer w-36"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={`status-opt-${k}`} value={k}>{v}</option>
            ))}
          </select>

          {/* Dept filter */}
          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="input-field text-xs h-8 py-0 px-3 cursor-pointer w-32"
            aria-label="Filter by department"
          >
            <option value="all">All Depts</option>
            {['Sales', 'Marketing', 'Finance'].map(d => (
              <option key={`dept-opt-${d}`} value={d}>{d}</option>
            ))}
          </select>

          <button className="btn-ghost text-xs h-8 px-3">
            <SlidersHorizontal size={13} />
            Columns
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedRows.size > 0 && (
        <div className="px-5 py-2.5 bg-cyan-500/8 border-b border-cyan-500/20 flex items-center gap-3 animate-float-up">
          <span className="text-xs font-semibold text-cyan-400">{selectedRows.size} selected</span>
          <button onClick={handleBulkDelete} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <Trash2 size={12} /> Delete selected
          </button>
          <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            <Copy size={12} /> Export selected
          </button>
          <button onClick={() => setSelectedRows(new Set())} className="ml-auto text-xs text-slate-500 hover:text-white transition-colors">
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                  aria-label="Select all rows"
                />
              </th>
              {[
                { field: 'claimNo' as SortField, label: 'Claim No.' },
                { field: 'employeeName' as SortField, label: 'Employee' },
                { field: null, label: 'Dept' },
                { field: null, label: 'Type' },
                { field: null, label: 'Expense Type' },
                { field: null, label: 'Party' },
                { field: 'claimedAmount' as SortField, label: 'Claimed ₹' },
                { field: null, label: 'Approval' },
                { field: 'status' as SortField, label: 'Status' },
                { field: 'submittedDate' as SortField, label: 'Submitted' },
                { field: null, label: '' },
              ].map((col, ci) => (
                <th
                  key={`col-${ci}`}
                  onClick={col.field ? () => handleSort(col.field!) : undefined}
                  className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 tracking-wide uppercase whitespace-nowrap ${col.field ? 'cursor-pointer hover:text-slate-300 transition-colors select-none' : ''}`}
                >
                  {col.label}
                  {col.field && <SortIcon field={col.field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Filter size={32} className="text-slate-700" />
                    <p className="text-sm font-semibold text-slate-500">No expense claims match your filters</p>
                    <p className="text-xs text-slate-600">Try adjusting the search or status filter</p>
                  </div>
                </td>
              </tr>
            ) : paginated.map((claim) => (
              <tr
                key={claim.id}
                className={`group transition-colors duration-100 hover:bg-white/3 ${selectedRows.has(claim.id) ? 'bg-cyan-500/5' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(claim.id)}
                    onChange={() => toggleRow(claim.id)}
                    className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                    aria-label={`Select claim ${claim.claimNo}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    {claim.policyViolation && <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" title="Policy violation" />}
                    <span className="text-xs font-mono text-cyan-400 whitespace-nowrap">{claim.claimNo}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div>
                    <p className="text-sm text-slate-200 font-medium whitespace-nowrap">{claim.employeeName}</p>
                    <p className="text-xs text-slate-500 font-mono">{claim.employeeId}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-slate-400">{claim.department}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                    claim.claimType === 'pre-claim' ? 'bg-blue-500/10 text-blue-400' :
                    claim.claimType === 'post-claim'? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'
                  }`}>
                    {claim.claimType === 'pre-claim' ? 'Pre-Claim' : claim.claimType === 'post-claim' ? 'Post-Claim' : 'Other'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-slate-300">{claim.expenseType}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs text-slate-400 max-w-[120px] truncate block">{claim.partyName}</span>
                </td>
                <td className="px-3 py-3">
                  <div>
                    <p className="text-sm font-mono font-semibold text-white">₹{claim.claimedAmount.toLocaleString('en-IN')}</p>
                    {claim.sanctionedAmount && claim.sanctionedAmount !== claim.claimedAmount && (
                      <p className="text-xs font-mono text-amber-400">₹{claim.sanctionedAmount.toLocaleString('en-IN')} sanctioned</p>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <ApprovalProgress level={claim.approvalLevel} total={claim.totalLevels} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={claim.status} />
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-mono text-slate-500">{claim.submittedDate}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="View claim details">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all" title="Edit claim">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Clone claim">
                      <Copy size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete claim — cannot be undone">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-slate-500 font-mono">
          Showing {Math.min((page - 1) * perPage + 1, sorted.length)}–{Math.min(page * perPage, sorted.length)} of {sorted.length} claims
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all ${
                  page === pageNum
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}