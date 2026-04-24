import React from 'react';
import MetricsBentoGrid from './MetricsBentoGrid';
import DashboardCharts from './DashboardCharts';
import ClaimsTable from './ClaimsTable';
import ActivityFeed from './ActivityFeed';
import DashboardHeader from './DashboardHeader';
import ComplianceBanner from './ComplianceBanner';

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <ComplianceBanner />
      <MetricsBentoGrid />
      <DashboardCharts />
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 2xl:col-span-3">
          <ClaimsTable />
        </div>
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}