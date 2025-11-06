'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        {description && (
          <p className="text-sm text-gray-600 ml-12">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
