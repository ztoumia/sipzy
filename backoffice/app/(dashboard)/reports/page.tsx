'use client';

import { Shield } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Reports Management"
        description="Manage content reports and moderation"
      />

      <EmptyState
        icon={Shield}
        title="Coming Soon"
        description="Reports management will be available soon"
      />
    </div>
  );
}
