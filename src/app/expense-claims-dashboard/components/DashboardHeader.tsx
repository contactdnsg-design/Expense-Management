'use client';
import React from 'react';
import Link from 'next/link';
import { Plus, Copy, Download, RefreshCw } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Expense Claims</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          <span className="text-slate-500">DNSG Ventures Pvt. Ltd.</span>
          <span className="mx-2 text-slate-700">·</span>
          <span className="font-mono text-xs text-slate-500">Last synced: 23 Apr 2026, 17:55 IST</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="btn-ghost text-sm">
          <RefreshCw size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button className="btn-ghost text-sm">
          <Download size={15} />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button className="btn-secondary text-sm">
          <Copy size={15} />
          Clone Claim
        </button>
        <Link href="/initial-selection-screen" className="btn-primary text-sm">
          <Plus size={16} />
          New Claim
        </Link>
      </div>
    </div>
  );
}