'use client';

import { CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function ResolvedReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={CheckSquare}
        title="Resolved Reports"
        description="Reports that have been resolved"
      />

      <EmptyState
        icon={CheckSquare}
        title="No resolved reports"
        description="Resolved reports will appear here"
      />
    </div>
  );
}
