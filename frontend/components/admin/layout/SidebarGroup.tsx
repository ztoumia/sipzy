'use client';

import { ReactNode } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';

export interface SidebarGroupProps {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: {
    count: number;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  };
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function SidebarGroup({
  id,
  icon: Icon,
  label,
  badge,
  children,
  defaultExpanded = true
}: SidebarGroupProps) {
  const { isCollapsed, expandedGroups, toggleGroup } = useAdminSidebar();
  const isExpanded = expandedGroups[id] ?? defaultExpanded;

  const handleToggle = () => {
    if (!isCollapsed) {
      toggleGroup(id);
    }
  };

  const badgeVariantClasses = {
    danger: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
  };

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative w-full',
          'text-gray-900 hover:bg-gray-100',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0 text-gray-700" />

        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-semibold text-left truncate">
              {label}
            </span>

            {badge && badge.count > 0 && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  badgeVariantClasses[badge.variant || 'info']
                )}
              >
                {badge.count}
              </span>
            )}

            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-500 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {label}
            {badge && badge.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded">
                {badge.count}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Group Children */}
      {!isCollapsed && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-1 py-1">
            {children}
          </div>
        </div>
      )}

      {/* Show children as separate items when collapsed */}
      {isCollapsed && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
