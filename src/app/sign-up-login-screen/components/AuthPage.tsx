'use client';
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import MFAModal from './MFAModal';
import BrandPanel from './BrandPanel';

export type AuthView = 'login' | 'signup';

export interface MFAState {
  open: boolean;
  email: string;
}

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [mfa, setMfa] = useState<MFAState>({ open: false, email: '' });

  return (
    <div className="min-h-screen flex bg-navy-950 overflow-hidden">
      {/* Left brand panel */}
      <BrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Background grid */}
        <div className="absolute inset-0 grid-scan-line opacity-40 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {view === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setView('signup')}
              onMFARequired={(email) => setMfa({ open: true, email })}
            />
          ) : (
            <SignupForm onSwitchToLogin={() => setView('login')} />
          )}
        </div>

        {/* MFA Modal */}
        {mfa.open && (
          <MFAModal
            email={mfa.email}
            onClose={() => setMfa({ open: false, email: '' })}
          />
        )}
      </div>
    </div>
  );
}