'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface PendingCounts {
  coffees: number;
  reports: number;
  users: number;
}

interface AdminSidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  pendingCounts: PendingCounts;
  updatePendingCounts: (counts: Partial<PendingCounts>) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'admin-sidebar-state';

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    coffees: 0,
    reports: 0,
    users: 0,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIsCollapsed(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
    }
  }, []);

  // Save state to localStorage
  const saveState = (collapsed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  };


  const toggle = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      saveState(newState);
      return newState;
    });
  };

  const collapse = () => {
    setIsCollapsed(true);
    saveState(true);
  };

  const expand = () => {
    setIsCollapsed(false);
    saveState(false);
  };

  const toggleMobile = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const updatePendingCounts = useCallback((counts: Partial<PendingCounts>) => {
    setPendingCounts(prev => ({ ...prev, ...counts }));
  }, []);

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggle,
        collapse,
        expand,
        toggleMobile,
        closeMobile,
        pendingCounts,
        updatePendingCounts,
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
}
