import React from 'react';
import SelectionHeader from './SelectionHeader';
import ClaimTypeCards from './ClaimTypeCards';
import RecentClaimsStrip from './RecentClaimsStrip';
import PolicySummaryPanel from './PolicySummaryPanel';
import ComplianceNotice from './ComplianceNotice';

export default function InitialSelectionContent() {
  return (
    <div className="space-y-6 max-w-screen-2xl">
      <SelectionHeader />
      <ComplianceNotice />
      <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <ClaimTypeCards />
        </div>
        <div className="xl:col-span-1">
          <PolicySummaryPanel />
        </div>
      </div>
      <RecentClaimsStrip />
    </div>
  );
}