'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, FileText, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Icon from '@/components/ui/AppIcon';


const monthlyData = [
  { month: 'Nov', amount: 142000 },
  { month: 'Dec', amount: 198000 },
  { month: 'Jan', amount: 165000 },
  { month: 'Feb', amount: 134000 },
  { month: 'Mar', amount: 221000 },
  { month: 'Apr', amount: 187000 },
];

const categoryData = [
  { name: 'Travel', value: 38, color: '#06b6d4' },
  { name: 'Meals', value: 22, color: '#8b5cf6' },
  { name: 'Software', value: 18, color: '#10b981' },
  { name: 'Training', value: 12, color: '#f59e0b' },
  { name: 'Office', value: 10, color: '#ef4444' },
];

const reportTypes = [
  { id: 'expense-summary', label: 'Expense Summary Report', description: 'Monthly breakdown of all expenses by category and department', icon: BarChart3 },
  { id: 'compliance-audit', label: 'Compliance Audit Report', description: 'Policy violations, flagged claims, and compliance score', icon: FileText },
  { id: 'team-spending', label: 'Team Spending Report', description: 'Per-member expense analysis and budget utilization', icon: DollarSign },
  { id: 'approval-cycle', label: 'Approval Cycle Report', description: 'Average approval times and bottleneck analysis', icon: Calendar },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="text-cyan-400 font-mono font-semibold">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-6-months');

  const totalSpend = monthlyData.reduce((s, d) => s + d.amount, 0);
  const lastMonth = monthlyData[monthlyData.length - 1].amount;
  const prevMonth = monthlyData[monthlyData.length - 2].amount;
  const change = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);
  const isUp = lastMonth > prevMonth;

  return (
    <AppLayout activeRoute="/reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="text-cyan-400" size={24} />
              Reports & Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Expense insights and compliance reporting</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Spend</p>
            <p className="text-xl font-bold text-white font-mono mt-1">₹{(totalSpend / 100000).toFixed(1)}L</p>
            <p className="text-xs text-slate-500 mt-0.5">6-month period</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">This Month</p>
            <p className="text-xl font-bold text-white font-mono mt-1">₹{(lastMonth / 1000).toFixed(0)}K</p>
            <div className={`flex items-center gap-1 mt-0.5 text-xs ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(Number(change))}% vs last month</span>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Avg per Claim</p>
            <p className="text-xl font-bold text-white font-mono mt-1">₹14.2K</p>
            <p className="text-xs text-slate-500 mt-0.5">Across 148 claims</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-slate-800/60">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Compliance Rate</p>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">94.2%</p>
            <p className="text-xs text-slate-500 mt-0.5">8 violations flagged</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 glass-card rounded-xl border border-slate-800/60 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6,182,212,0.05)' }} />
                <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="glass-card rounded-xl border border-slate-800/60 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Spend by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Downloads */}
        <div className="glass-card rounded-xl border border-slate-800/60 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Generate Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportTypes.map(report => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/60 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium">{report.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{report.description}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium transition-colors flex-shrink-0">
                    <Download size={12} />
                    Export
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
