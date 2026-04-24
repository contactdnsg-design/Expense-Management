'use client';
import React from 'react';
import ClaimVolumeChart from './ClaimVolumeChart';
import ExpenseByTypeChart from './ExpenseByTypeChart';

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
      <div className="lg:col-span-3 xl:col-span-3">
        <ClaimVolumeChart />
      </div>
      <div className="lg:col-span-2 xl:col-span-2">
        <ExpenseByTypeChart />
      </div>
    </div>
  );
}