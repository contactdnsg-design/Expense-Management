'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Settings, Building2, Shield, Bell, CreditCard, Save, ChevronRight, Lock, Globe, Mail, Smartphone } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const tabs = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'security', label: 'Security & Auth', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'policies', label: 'Expense Policies', icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization');
  const [orgName, setOrgName] = useState('DNSG Ventures Pvt. Ltd.');
  const [orgDomain, setOrgDomain] = useState('dnsgventures.in');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('8');
  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(false);
  const [travelLimit, setTravelLimit] = useState('80000');
  const [mealLimit, setMealLimit] = useState('5000');
  const [requireReceipts, setRequireReceipts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout activeRoute="/settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="text-cyan-400" size={24} />
              Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure your tenant, security, and expense policies</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-navy-950'}`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="glass-card rounded-xl border border-slate-800/60 p-2 space-y-0.5">
              {tabs?.map(tab => {
                const Icon = tab?.icon;
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab?.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} />
                      {tab?.label}
                    </div>
                    <ChevronRight size={13} className="opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 glass-card rounded-xl border border-slate-800/60 p-6">
            {activeTab === 'organization' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-white flex items-center gap-2"><Building2 size={16} className="text-cyan-400" />Organization Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Organization Name</label>
                    <input value={orgName} onChange={e => setOrgName(e?.target?.value)} className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Domain</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input value={orgDomain} onChange={e => setOrgDomain(e?.target?.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Tenant ID</label>
                    <input value="tenant_dnsg_001" readOnly className="w-full px-3 py-2.5 bg-slate-900/40 border border-slate-800/60 rounded-lg text-sm text-slate-500 font-mono cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Timezone</label>
                    <select className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                      <option>Asia/Kolkata (IST, UTC+5:30)</option>
                      <option>UTC</option>
                      <option>America/New_York</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-white flex items-center gap-2"><Shield size={16} className="text-cyan-400" />Security & Authentication</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Require MFA for all users', desc: 'Enforce multi-factor authentication across the tenant', value: mfaRequired, setter: setMfaRequired, icon: Smartphone },
                    { label: 'Enable Google SSO', desc: 'Allow users to sign in with their Google Workspace account', value: ssoEnabled, setter: setSsoEnabled, icon: Globe },
                  ]?.map(item => {
                    const Icon = item?.icon;
                    return (
                      <div key={item?.label} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/40 border border-slate-800/40">
                        <div className="flex items-start gap-3">
                          <Icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-slate-200 text-sm font-medium">{item?.label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{item?.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => item?.setter(!item?.value)}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item?.value ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item?.value ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} className="text-slate-400" />
                      <p className="text-slate-200 text-sm font-medium">Session Timeout</p>
                    </div>
                    <select value={sessionTimeout} onChange={e => setSessionTimeout(e?.target?.value)} className="px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                      <option value="1">1 hour</option>
                      <option value="4">4 hours</option>
                      <option value="8">8 hours</option>
                      <option value="24">24 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-white flex items-center gap-2"><Bell size={16} className="text-cyan-400" />Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive claim updates and approvals via email', value: emailNotif, setter: setEmailNotif, icon: Mail },
                    { label: 'Slack Integration', desc: 'Send notifications to your Slack workspace', value: slackNotif, setter: setSlackNotif, icon: Bell },
                  ]?.map(item => {
                    const Icon = item?.icon;
                    return (
                      <div key={item?.label} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/40 border border-slate-800/40">
                        <div className="flex items-start gap-3">
                          <Icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-slate-200 text-sm font-medium">{item?.label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{item?.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => item?.setter(!item?.value)}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item?.value ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${item?.value ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-white flex items-center gap-2"><CreditCard size={16} className="text-cyan-400" />Expense Policies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Travel Claim Limit (₹)</label>
                    <input type="number" value={travelLimit} onChange={e => setTravelLimit(e?.target?.value)} className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Meal Claim Limit (₹)</label>
                    <input type="number" value={mealLimit} onChange={e => setMealLimit(e?.target?.value)} className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/40 border border-slate-800/40">
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Require Receipts</p>
                    <p className="text-slate-500 text-xs mt-0.5">Mandate receipt uploads for all claims above ₹500</p>
                  </div>
                  <button
                    onClick={() => setRequireReceipts(!requireReceipts)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${requireReceipts ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${requireReceipts ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
