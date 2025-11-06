'use client';

import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function PendingReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={AlertTriangle}
        title="Pending Reports"
        description="Reports awaiting moderation"
      />

      <EmptyState
        icon={AlertTriangle}
        title="Coming Soon"
        description="Pending reports list will be available soon"
      />
    </div>
  );
}
