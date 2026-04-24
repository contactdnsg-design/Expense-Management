'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, BarChart3, Zap, Lock, ArrowRight, Star, FileText, ChevronRight, Globe, Award, Check, CreditCard, Building2, Layers } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// Intersection observer hook
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const stats = [
  { value: 98, suffix: '%', label: 'Compliance Rate', icon: Shield },
  { value: 2400, suffix: '+', label: 'Enterprise Clients', icon: Building2 },
  { value: 4, suffix: 'M+', label: 'Claims Processed', icon: FileText },
  { value: 99, suffix: '.9%', label: 'Uptime SLA', icon: Zap },
];

const features = [
  {
    icon: Shield,
    title: 'HIPAA & GDPR Compliant',
    description: 'Built from the ground up with compliance at its core. SOC 2 Type II certified with end-to-end encryption.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    size: 'col-span-2 row-span-1',
  },
  {
    icon: Layers,
    title: 'Multi-Level Approvals',
    description: 'Configurable approval chains with SLA tracking, escalation rules, and real-time notifications.',
    color: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    size: 'col-span-1 row-span-2',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live dashboards with spend forecasting and anomaly detection.',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Zap,
    title: 'AI Policy Enforcement',
    description: 'Automated policy checks flag violations before submission, reducing manual review by 70%.',
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    size: 'col-span-1 row-span-1',
  },
  {
    icon: Globe,
    title: 'Multi-Currency & Multi-Tenant',
    description: 'Support for 150+ currencies, global tax compliance, and isolated tenant environments.',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    size: 'col-span-2 row-span-1',
  },
];

const testimonials = [
  {
    quote: 'ClaimFlow reduced our expense processing time from 14 days to under 48 hours. The compliance automation alone saved us 200+ hours per quarter.',
    name: 'Arjun Kapoor',
    title: 'CFO, TechNova Solutions',
    avatar: 'AK',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    quote: 'The HIPAA compliance features were a game-changer for our healthcare operations. Audit trails are immaculate and the approval workflows are exactly what we needed.',
    name: 'Priya Mehta',
    title: 'Head of Finance, MedCore India',
    avatar: 'PM',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    quote: 'Onboarded 500 employees in a single day. The role-based access control and policy engine are incredibly powerful yet intuitive.',
    name: 'Rahul Sharma',
    title: 'VP Operations, GlobalEdge Corp',
    avatar: 'RS',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹2,999',
    period: '/month',
    description: 'For growing teams up to 25 members',
    features: ['Up to 25 users', 'Basic approval workflows', 'Standard reports', 'Email support', '99.5% uptime SLA'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₹8,999',
    period: '/month',
    description: 'For mid-size enterprises up to 200 members',
    features: ['Up to 200 users', 'Multi-level approvals', 'Advanced analytics', 'HIPAA compliance', 'Priority support', '99.9% uptime SLA', 'API access'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with complex needs',
    features: ['Unlimited users', 'Custom workflows', 'White-label option', 'SOC 2 + GDPR', 'Dedicated CSM', '99.99% uptime SLA', 'On-premise option'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useInView(0.3);
  const c1 = useCounter(98, 1800, statsRef.inView);
  const c2 = useCounter(2400, 2000, statsRef.inView);
  const c3 = useCounter(4, 1500, statsRef.inView);
  const c4 = useCounter(999, 2200, statsRef.inView);

  const counterValues = [c1, c2, c3, c4];
  const featuresRef = useInView(0.1);
  const testimonialsRef = useInView(0.1);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/6 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div className="absolute inset-0 grid-scan-line opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">ClaimFlow</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v2.4.1
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Compliance', 'Pricing', 'Enterprise'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-up-login-screen" className="text-sm text-slate-400 hover:text-white transition-colors font-medium hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold rounded-lg text-sm transition-all duration-200 active:scale-95"
              style={{ boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-8 animate-float-up">
              <Shield size={12} />
              <span>HIPAA · SOC 2 Type II · GDPR Compliant</span>
              <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
              style={{ animationDelay: '0.1s' }}>
              Expense Claims,{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                  Reimagined
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/60 to-violet-400/0" />
              </span>
              {' '}for Enterprise
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              The only expense management platform built with compliance at its core. Multi-level approvals, real-time policy enforcement, and audit-ready reporting — all in one secure workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up-login-screen"
                className="flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-base transition-all duration-200 active:scale-95 group"
                style={{ boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
              >
                Start Free Trial
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/expense-claims-dashboard"
                className="flex items-center gap-2 px-8 py-3.5 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600 font-semibold rounded-xl text-base transition-all duration-200"
              >
                View Live Demo
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-500">
              {['No credit card required', '14-day free trial', 'SOC 2 certified', 'GDPR compliant'].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent z-10 pointer-events-none" style={{ top: '60%' }} />
              <div
                className="rounded-2xl overflow-hidden border border-slate-700/40"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1), 0 0 60px rgba(6,182,212,0.05)' }}
              >
                {/* Mock dashboard preview */}
                <div className="bg-navy-900/90 p-4 border-b border-slate-800/60 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex-1 h-6 bg-slate-800/60 rounded-md flex items-center px-3">
                    <span className="text-xs text-slate-500 font-mono">claimflow.app/dashboard</span>
                  </div>
                </div>
                <div className="bg-navy-950 p-6 grid grid-cols-4 gap-4 min-h-48">
                  {[
                    { label: 'Total Claims', value: '₹12.4L', change: '+8.2%', color: 'text-cyan-400' },
                    { label: 'Pending Review', value: '23', change: '5 urgent', color: 'text-amber-400' },
                    { label: 'Approved Today', value: '18', change: '₹3.2L', color: 'text-emerald-400' },
                    { label: 'Compliance Score', value: '98.4%', change: 'Excellent', color: 'text-violet-400' },
                  ].map((card, i) => (
                    <div key={i} className="glass-card rounded-xl p-4 border border-slate-800/60">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{card.label}</p>
                      <p className={`text-xl font-bold mt-1 font-mono ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{card.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6 border-y border-slate-800/40">
        <div ref={statsRef.ref} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const displayValue = i === 3
                ? `${Math.floor(counterValues[i] / 10)}.${counterValues[i] % 10}%`
                : `${counterValues[i]}${stat.suffix}`;
              return (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    opacity: statsRef.inView ? 1 : 0,
                    transform: statsRef.inView ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <p className="text-3xl font-bold text-white font-mono">{displayValue}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
              <Layers size={12} />
              Platform Features
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">Everything your finance team needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From submission to reimbursement — ClaimFlow handles every step with precision, compliance, and speed.</p>
          </div>

          <div ref={featuresRef.ref} className="grid grid-cols-3 grid-rows-3 gap-4 auto-rows-fr">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`${feature.size} glass-card rounded-2xl p-6 border ${feature.border} hover:scale-[1.02] cursor-default group`}
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace(' to-', ', ')})`,
                    opacity: featuresRef.inView ? 1 : 0,
                    transform: featuresRef.inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
                    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className={feature.iconColor} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                <Shield size={12} />
                Enterprise Compliance
              </span>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Built for regulated industries. Trusted by compliance teams.
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                ClaimFlow is the only expense platform purpose-built for organizations operating under HIPAA, GDPR, SOC 2, and ISO 27001 requirements. Every transaction is logged, every policy enforced, every audit trail preserved.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, label: 'HIPAA Compliant', desc: 'PHI handling with BAA support', color: 'text-emerald-400' },
                  { icon: Globe, label: 'GDPR Ready', desc: 'Data residency controls & DPA', color: 'text-blue-400' },
                  { icon: Award, label: 'SOC 2 Type II', desc: 'Annual third-party audits', color: 'text-violet-400' },
                  { icon: Lock, label: 'ISO 27001', desc: 'Information security certified', color: 'text-amber-400' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-xl border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className={item.color} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <CheckCircle size={16} className="text-emerald-400 ml-auto flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="glass-card-elevated rounded-2xl p-6 border border-slate-700/40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-slate-300">Compliance Dashboard</h3>
                  <span className="text-xs text-emerald-400 font-mono">Live</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'HIPAA Score', value: 98, color: 'bg-emerald-500' },
                    { label: 'GDPR Score', value: 96, color: 'bg-blue-500' },
                    { label: 'SOC 2 Score', value: 99, color: 'bg-violet-500' },
                    { label: 'ISO 27001', value: 94, color: 'bg-amber-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400">{item.label}</span>
                        <span className="text-xs font-mono text-slate-300">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">All systems compliant · Last audit: 2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
              <Star size={12} />
              Customer Stories
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by finance leaders</h2>
            <p className="text-slate-400">See how enterprises are transforming their expense operations with ClaimFlow.</p>
          </div>

          <div ref={testimonialsRef.ref} className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-300 hover:-translate-y-1"
                style={{
                  opacity: testimonialsRef.inView ? 1 : 0,
                  transform: testimonialsRef.inView ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
              <CreditCard size={12} />
              Transparent Pricing
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, predictable pricing</h2>
            <p className="text-slate-400">No hidden fees. No per-claim charges. Just straightforward pricing that scales with your team.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent' :'glass-card border-slate-800/60 hover:border-slate-700/60'
                }`}
                style={plan.highlighted ? { boxShadow: '0 0 40px rgba(6,182,212,0.15)' } : {}}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-cyan-500 text-navy-950 text-xs font-bold rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white font-mono">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up-login-screen"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    plan.highlighted
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-navy-950' :'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600'
                  }`}
                  style={plan.highlighted ? { boxShadow: '0 0 20px rgba(6,182,212,0.3)' } : {}}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 border border-cyan-500/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.08) 100%)' }}
          >
            <div className="absolute inset-0 grid-scan-line opacity-30" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: '0 0 40px rgba(6,182,212,0.4)' }}>
                <Zap size={28} className="text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your expense operations?</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join 2,400+ enterprises that trust ClaimFlow for compliant, efficient expense management. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up-login-screen"
                  className="flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-base transition-all duration-200 active:scale-95 group"
                  style={{ boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
                >
                  Start Free Trial
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/expense-claims-dashboard"
                  className="flex items-center gap-2 px-8 py-3.5 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600 font-semibold rounded-xl text-base transition-all duration-200"
                >
                  Explore Dashboard
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <CreditCard size={16} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-white">ClaimFlow</span>
                <p className="text-xs text-slate-500">Enterprise Expense Management</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
              <a href="#compliance" className="hover:text-slate-300 transition-colors">Compliance</a>
              <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
              <Link href="/sign-up-login-screen" className="hover:text-slate-300 transition-colors">Sign In</Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield size={12} className="text-emerald-400" />
                SOC 2 Certified
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">© 2026 ClaimFlow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
