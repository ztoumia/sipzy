'use client';

import { Crown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Crown}
        title="Administrator Users"
        description="View and manage administrator accounts"
      />

      <EmptyState
        icon={Crown}
        title="Coming Soon"
        description="Admin users list will be available soon"
      />
    </div>
  );
}
