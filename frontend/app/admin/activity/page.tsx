'use client';

import { Activity } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title="Activity Log"
        description="View admin activity history"
      />

      <EmptyState
        icon={Activity}
        title="Coming Soon"
        description="Activity log will be available soon"
      />
    </div>
  );
}
