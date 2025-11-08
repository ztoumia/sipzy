'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@sipzy/shared/lib/utils';

interface ImportProgressProps {
  current: number;
  total: number;
  status: 'idle' | 'importing' | 'completed' | 'error';
}

export function ImportProgress({ current, total, status }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Status Message */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {status === 'importing' && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          )}
          <span className="font-medium text-gray-900">
            {status === 'importing' && 'Importing...'}
            {status === 'completed' && 'Import Completed'}
            {status === 'error' && 'Import Failed'}
          </span>
        </div>
        <span className="text-gray-600">
          {current} / {total} items
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 transition-all duration-300 rounded-full',
            status === 'importing' && 'bg-blue-600',
            status === 'completed' && 'bg-green-600',
            status === 'error' && 'bg-red-600'
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Animated stripe for importing state */}
        {status === 'importing' && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
      </div>

      {/* Percentage */}
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
