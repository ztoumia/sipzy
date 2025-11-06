'use client';

import { useEffect } from 'react';
import {
  Home,
  Coffee,
  Users,
  Shield,
  Download,
  Activity,
  BarChart,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { SidebarItem } from './SidebarItem';

export function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggle, closeMobile, pendingCounts, updatePendingCounts } = useAdminSidebar();

  // Fetch pending counts on mount and periodically
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();

        // Mock data for now
        updatePendingCounts({
          coffees: 15,
          reports: 3,
          users: 0,
        });
      } catch (error) {
        console.error('Failed to fetch pending counts:', error);
      }
    };

    fetchPendingCounts();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);

    return () => clearInterval(interval);
  }, [updatePendingCounts]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col',
          // Desktop
          'hidden lg:flex',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile
          isMobileOpen && 'flex lg:hidden w-64'
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          'h-16 border-b border-gray-200 flex items-center px-4 shrink-0',
          isCollapsed && 'justify-center px-2'
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Sipzy Admin</span>
            </div>
          ) : (
            <Coffee className="w-6 h-6 text-blue-600" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {/* Dashboard */}
          <SidebarItem
            icon={Home}
            label="Dashboard"
            href="/admin"
          />

          {/* Coffees */}
          <SidebarItem
            icon={Coffee}
            label="Coffees"
            href="/admin/coffees"
            badge={pendingCounts.coffees > 0 ? {
              count: pendingCounts.coffees,
              variant: 'warning'
            } : undefined}
          />

          {/* Users */}
          <SidebarItem
            icon={Users}
            label="Users"
            href="/admin/users"
          />

          {/* Reports */}
          <SidebarItem
            icon={Shield}
            label="Reports"
            href="/admin/reports"
            badge={pendingCounts.reports > 0 ? {
              count: pendingCounts.reports,
              variant: 'danger'
            } : undefined}
          />

          {/* Import */}
          <SidebarItem
            icon={Download}
            label="Import"
            href="/admin/import"
          />

          {/* Divider */}
          {!isCollapsed && (
            <div className="my-2">
              <div className="border-t border-gray-200"></div>
            </div>
          )}

          {/* Activity Log */}
          <SidebarItem
            icon={Activity}
            label="Activity Log"
            href="/admin/activity"
          />

          {/* Analytics */}
          <SidebarItem
            icon={BarChart}
            label="Analytics"
            href="/admin/analytics"
          />

          {/* Settings */}
          <SidebarItem
            icon={Settings}
            label="Settings"
            href="/admin/settings"
          />
        </nav>

        {/* Collapse Toggle Button */}
        <div className="shrink-0 border-t border-gray-200 p-2 hidden lg:block">
          <button
            onClick={toggle}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 text-gray-700 transition-transform duration-200',
                isCollapsed && 'rotate-180'
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium text-gray-700">Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer for fixed sidebar (Desktop only) */}
      <div
        className={cn(
          'hidden lg:block shrink-0 transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      />
    </>
  );
}
