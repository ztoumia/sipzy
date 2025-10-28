'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

/**
 * Layout commun pour toutes les pages avec Header et Footer
 * Ce composant gère automatiquement l'authentification et passe les props au Header
 */
export function PageLayout({ children, showFooter = true }: PageLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip link pour l'accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-coffee-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Aller au contenu principal
      </a>

      <Header user={user} onLogout={logout} />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
