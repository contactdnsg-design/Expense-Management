'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard, FileText, Clock, CheckSquare, BarChart3,
  Settings, Users, Shield, ChevronLeft, ChevronRight,
  LogOut, Bell, CreditCard, AlertTriangle, X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/expense-claims-dashboard', group: 'main' },
  { id: 'nav-claims', label: 'My Claims', icon: <FileText size={18} />, href: '/my-claims', badge: 3, group: 'main' },
  { id: 'nav-new-claim', label: 'New Claim', icon: <CreditCard size={18} />, href: '/initial-selection-screen', group: 'main' },
  { id: 'nav-approvals', label: 'Approvals', icon: <CheckSquare size={18} />, href: '/approvals', badge: 5, group: 'workflow' },
  { id: 'nav-manager', label: 'Manager View', icon: <Users size={18} />, href: '/manager-dashboard', group: 'workflow' },
  { id: 'nav-finance', label: 'Finance View', icon: <Bell size={18} />, href: '/finance-dashboard', group: 'workflow' },
  { id: 'nav-activity', label: 'Activity Log', icon: <Clock size={18} />, href: '/activity-log', group: 'workflow' },
  { id: 'nav-violations', label: 'Policy Alerts', icon: <AlertTriangle size={18} />, href: '/finance-dashboard', badge: 2, group: 'workflow' },
  { id: 'nav-reports', label: 'Reports', icon: <BarChart3 size={18} />, href: '/reports', group: 'analytics' },
  { id: 'nav-users', label: 'Team Members', icon: <Users size={18} />, href: '/team-members', group: 'admin' },
  { id: 'nav-compliance', label: 'Compliance', icon: <Shield size={18} />, href: '/compliance', group: 'admin' },
  { id: 'nav-settings', label: 'Settings', icon: <Settings size={18} />, href: '/settings', group: 'admin' },
];

const groups = [
  { id: 'main', label: 'WORKSPACE' },
  { id: 'workflow', label: 'WORKFLOW' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'admin', label: 'ADMINISTRATION' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeRoute?: string;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, activeRoute, onMobileClose }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col glass-card border-r border-slate-800/60 relative">
      {/* Mobile close */}
      <button
        onClick={onMobileClose}
        className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Close sidebar"
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div>
            <span className="font-bold text-base text-white tracking-tight">ClaimFlow</span>
            <p className="text-xs text-cyan-500/70 font-mono">v2.4.1</p>
          </div>
        )}
      </div>

      {/* Tenant selector */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/40 cursor-pointer hover:border-cyan-500/30 transition-all duration-200 group">
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Tenant</p>
          <p className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">DNSG Ventures Pvt. Ltd.</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-4">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group.id);
          return (
            <div key={`group-${group.id}`}>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-600 tracking-widest uppercase px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item, itemIdx) => {
                  const isActive = activeRoute === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' :'text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:translate-x-0.5'
                      }`}
                      title={collapsed ? item.label : undefined}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-r-full" />
                      )}
                      <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full border ${isActive ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom: User + collapse */}
      <div className="border-t border-slate-800/60 p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all">
              SS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">Sunny Singh</p>
              <p className="text-xs text-slate-500 truncate">Member · E12345</p>
            </div>
            <Bell size={15} className="text-slate-500 flex-shrink-0 group-hover:text-slate-400 transition-colors" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 text-xs font-medium transition-all duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
        <Link href="/sign-up-login-screen" className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all duration-200">
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}