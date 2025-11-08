'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@sipzy/shared/lib/utils';
import { useAdminSidebar } from '@/contexts/AdminSidebarContext';
import { useState } from 'react';

export interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: {
    count: number;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  };
  onClick?: () => void;
  indent?: boolean;
}

export function SidebarItem({ icon: Icon, label, href, badge, onClick, indent = false }: SidebarItemProps) {
  const pathname = usePathname();
  const { isCollapsed, closeMobile } = useAdminSidebar();
  const [isNavigating, setIsNavigating] = useState(false);

  // Special case: for /admin route, only match exactly
  // For other routes, match if starts with the href
  const isActive = href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(href + '/');

  const handleClick = (e: React.MouseEvent) => {
    // Don't show loading if already on the exact same page
    if (pathname === href) {
      e.preventDefault();
      return;
    }

    setIsNavigating(true);

    if (onClick) {
      onClick();
    }
    closeMobile();

    // Reset after a delay (navigation should complete by then)
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const badgeVariantClasses = {
    danger: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
        indent && 'ml-4',
        isActive
          ? 'bg-blue-500/10 text-blue-600 border-l-4 border-blue-500 pl-2'
          : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent',
        isCollapsed && 'justify-center px-2',
        isNavigating && 'opacity-60'
      )}
    >
      {isNavigating ? (
        <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-blue-600" />
      ) : (
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-600')} />
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">{label}</span>

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
    </Link>
  );
}
