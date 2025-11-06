'use client';

import { Users } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="User Management"
        description="Manage users, ban/unban, and view user details"
      />

      <EmptyState
        icon={Users}
        title="Coming Soon"
        description="User management will be available soon"
      />
    </div>
  );
}
