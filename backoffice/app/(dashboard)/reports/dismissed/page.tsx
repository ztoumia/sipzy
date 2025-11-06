'use client';

import { SkipForward } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function DismissedReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={SkipForward}
        title="Dismissed Reports"
        description="Reports that have been dismissed"
      />

      <EmptyState
        icon={SkipForward}
        title="No dismissed reports"
        description="Dismissed reports will appear here"
      />
    </div>
  );
}
