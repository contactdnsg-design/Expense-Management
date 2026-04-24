import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06b6d4',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://claimflow7165.builtwithrocket.new'),
  title: {
    default: 'ClaimFlow — Enterprise Expense Claim & Reimbursement Platform',
    template: '%s | ClaimFlow',
  },
  description: 'ClaimFlow is a HIPAA/GDPR-compliant, multi-tenant expense claim and reimbursement platform with multi-level approval workflows, real-time compliance monitoring, and AI-powered policy enforcement for enterprise teams.',
  keywords: [
    'expense management software',
    'expense claim platform',
    'reimbursement software',
    'HIPAA compliant expense management',
    'enterprise expense tracking',
    'multi-level approval workflow',
    'compliance expense management',
    'corporate expense reimbursement',
    'SOC 2 expense platform',
    'GDPR expense management',
  ],
  authors: [{ name: 'ClaimFlow', url: 'https://claimflow7165.builtwithrocket.new' }],
  creator: 'ClaimFlow',
  publisher: 'ClaimFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://claimflow7165.builtwithrocket.new',
    siteName: 'ClaimFlow',
    title: 'ClaimFlow — Enterprise Expense Claim & Reimbursement Platform',
    description: 'HIPAA/GDPR-compliant expense management with multi-level approvals, real-time compliance monitoring, and AI-powered policy enforcement.',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'ClaimFlow — Enterprise Expense Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClaimFlow — Enterprise Expense Claim & Reimbursement Platform',
    description: 'HIPAA/GDPR-compliant expense management with multi-level approvals and real-time compliance monitoring.',
    images: ['/assets/images/app_logo.png'],
    creator: '@claimflow',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [{ url: '/favicon.ico' }],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://claimflow7165.builtwithrocket.new',
  },
  category: 'technology',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ClaimFlow',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Enterprise-grade expense claim and reimbursement platform with HIPAA/GDPR compliance, multi-level approval workflows, and real-time policy enforcement.',
  url: 'https://claimflow7165.builtwithrocket.new',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Multi-level approval workflows',
    'HIPAA/GDPR compliance',
    'SOC 2 Type II certified',
    'Real-time expense tracking',
    'AI-powered policy enforcement',
    'Multi-tenant architecture',
    'Role-based access control',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
</head>
      <body className="bg-navy-950 text-slate-100 antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111827',
              border: '1px solid rgba(6,182,212,0.25)',
              color: '#e2e8f0',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}