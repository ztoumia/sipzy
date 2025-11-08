'use client';

import { UserX } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function BannedUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserX}
        title="Banned Users"
        description="View and manage banned users"
      />

      <EmptyState
        icon={UserX}
        title="Coming Soon"
        description="Banned users list will be available soon"
      />
    </div>
  );
}
