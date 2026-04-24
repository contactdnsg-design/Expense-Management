import React from 'react';
import AppLayout from '@/components/AppLayout';
import InitialSelectionContent from './components/InitialSelectionContent';

export default function InitialSelectionPage() {
  return (
    <AppLayout activeRoute="/initial-selection-screen">
      <InitialSelectionContent />
    </AppLayout>
  );
}