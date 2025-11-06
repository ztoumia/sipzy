'use client';

import { Factory } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function RoastersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Factory}
        title="Roasters Management"
        description="Manage coffee roasters"
      />

      <EmptyState
        icon={Factory}
        title="Coming Soon"
        description="Roasters management will be available soon"
      />
    </div>
  );
}
