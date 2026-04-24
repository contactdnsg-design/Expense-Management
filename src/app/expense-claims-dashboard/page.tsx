import React from 'react';
import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';
import DashboardContent from './components/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Real-time expense claims dashboard with compliance monitoring, approval workflows, and spend analytics for your organization.',
};

export default function ExpenseClaimsDashboardPage() {
  return (
    <AppLayout activeRoute="/expense-claims-dashboard">
      <DashboardContent />
    </AppLayout>
  );
}