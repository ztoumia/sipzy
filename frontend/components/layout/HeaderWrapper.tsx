'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

/**
 * Wrapper client pour le Header qui gère l'authentification
 * Permet d'utiliser le Header dans des Server Components
 */
export function HeaderWrapper() {
  const { user, logout, isLoading } = useAuth();

  return <Header user={user} onLogout={logout} isLoading={isLoading} />;
}
