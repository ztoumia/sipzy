import React from 'react';
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
import { Footer } from '@/components/layout/Footer';

interface PageLayoutServerProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

/**
 * Layout commun pour les Server Components (pages avec generateMetadata)
 * Utilise HeaderWrapper qui gère l'authentification côté client
 */
export function PageLayoutServer({ children, showFooter = true }: PageLayoutServerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
