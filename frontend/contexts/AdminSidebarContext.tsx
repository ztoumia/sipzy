'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'admin-sidebar-state';
const GROUPS_STORAGE_KEY = 'admin-sidebar-groups';

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    coffees: 0,
    reports: 0,
    users: 0,
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    coffees: true,
    users: true,
    reports: true,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIsCollapsed(JSON.parse(stored));
      }

      const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (storedGroups) {
        setExpandedGroups(JSON.parse(storedGroups));
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

  const saveGroups = (groups: Record<string, boolean>) => {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups state:', error);
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

  const updatePendingCounts = (counts: Partial<PendingCounts>) => {
    setPendingCounts(prev => ({ ...prev, ...counts }));
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newGroups = { ...prev, [groupId]: !prev[groupId] };
      saveGroups(newGroups);
      return newGroups;
    });
  };

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
        expandedGroups,
        toggleGroup,
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
