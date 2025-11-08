'use client';

import { cn } from '@sipzy/shared/lib/utils';

export interface FilterTab<T extends string = string> {
  id: T;
  label: string;
  color?: 'blue' | 'yellow' | 'green' | 'red' | 'gray';
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
}

export function FilterTabs<T extends string>({ tabs, activeTab, onChange }: FilterTabsProps<T>) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    gray: 'bg-gray-600 hover:bg-gray-700',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = tab.color || 'blue';

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? `text-white ${colorClasses[color]}`
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 text-xs font-semibold rounded-full',
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
