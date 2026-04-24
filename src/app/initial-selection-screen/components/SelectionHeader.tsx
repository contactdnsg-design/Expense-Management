'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function SelectionHeader() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router?.push('/expense-claims-dashboard')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">New Expense Claim</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Step 1 of 9 — Select claim type to begin
            <span className="mx-2 text-slate-700">·</span>
            <span className="font-mono text-xs text-slate-500">Employee: Sunny Singh · E12345 · Sales</span>
          </p>
        </div>
      </div>
      <button className="btn-ghost text-sm">
        <HelpCircle size={15} />
        Claim Guide
      </button>
    </div>
  );
}