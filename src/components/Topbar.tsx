'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Shield, HelpCircle, ChevronDown, Check, Clock, AlertCircle, Settings, LogOut, User, CreditCard, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


interface TopbarProps {
  onMobileMenuToggle: () => void;
}

interface Notification {
  id: string;
  type: 'approval' | 'alert' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'approval', title: 'Claim Approved', message: 'CLM-2026-001 has been approved by Admin', time: '2m ago', read: false },
  { id: 'n2', type: 'alert', title: 'Policy Violation', message: 'CLM-2026-008 exceeds meal limit by ₹800', time: '15m ago', read: false },
  { id: 'n3', type: 'info', title: 'New Claim Submitted', message: 'Priya Sharma submitted a travel claim', time: '1h ago', read: false },
  { id: 'n4', type: 'approval', title: 'Approval Required', message: 'CLM-2026-016 awaiting your review', time: '2h ago', read: true },
  { id: 'n5', type: 'info', title: 'Report Ready', message: 'Q1 Expense Summary report is ready', time: '1d ago', read: true },
];

const notifTypeConfig = {
  approval: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  alert: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  info: { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export default function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-slate-800/60 bg-navy-900/90 backdrop-blur-md flex-shrink-0 z-30 relative">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className={`flex-1 max-w-md relative transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search claims, IDs, parties… (⌘K)"
          className="input-field pl-9 pr-4 py-2 text-sm h-9"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search claims"
        />
      </div>

      <div className="flex-1" />

      {/* Compliance badge */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <Shield size={11} />
        <span>HIPAA · SOC 2</span>
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen(prev => !prev); setUserOpen(false); }}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
          aria-label="Notifications"
          aria-expanded={notifOpen}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-[9px] font-bold text-navy-950 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 glass-card-elevated rounded-xl border border-slate-700/60 shadow-2xl z-50 animate-float-up overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-400 text-xs font-mono px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Mark all read
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {notifications.map((notif) => {
                const cfg = notifTypeConfig[notif.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors border-b border-slate-800/40 last:border-0 ${!notif.read ? 'bg-cyan-500/[0.03]' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-semibold ${notif.read ? 'text-slate-400' : 'text-slate-200'}`}>{notif.title}</p>
                        {!notif.read && <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{notif.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-800/60">
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium w-full text-center">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help */}
      <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95" aria-label="Help">
        <HelpCircle size={18} />
      </button>

      {/* User Menu */}
      <div ref={userRef} className="relative">
        <button
          onClick={() => { setUserOpen(prev => !prev); setNotifOpen(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 active:scale-95"
          aria-expanded={userOpen}
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-cyan-500/20">
            SS
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Sunny Singh</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Member</p>
          </div>
          <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* User Dropdown */}
        {userOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 glass-card-elevated rounded-xl border border-slate-700/60 shadow-2xl z-50 animate-float-up overflow-hidden">
            {/* Profile header */}
            <div className="px-4 py-3 border-b border-slate-800/60 bg-gradient-to-r from-cyan-500/5 to-violet-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                  SS
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Sunny Singh</p>
                  <p className="text-xs text-slate-500">sunny.singh@dnsgventures.in</p>
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Member · E12345
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <User size={15} className="text-slate-500" />
                My Profile
              </Link>
              <Link href="/my-claims" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <CreditCard size={15} className="text-slate-500" />
                My Claims
              </Link>
              <Link href="/reports" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <BarChart3 size={15} className="text-slate-500" />
                Reports
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <Settings size={15} className="text-slate-500" />
                Settings
              </Link>
            </div>

            <div className="border-t border-slate-800/60 py-1.5">
              <Link href="/sign-up-login-screen" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                <LogOut size={15} />
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}