'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

function ToastWrapper({ children }: { children: React.ReactNode }) {
  const { toasts, hideToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastWrapper>
          {children}
        </ToastWrapper>
      </ToastProvider>
    </AuthProvider>
  );
}
