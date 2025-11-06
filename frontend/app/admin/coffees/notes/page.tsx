'use client';

import { Palette } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { EmptyState } from '@/components/admin/shared/EmptyState';

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Palette}
        title="Tasting Notes Management"
        description="Manage coffee tasting notes and flavors"
      />

      <EmptyState
        icon={Palette}
        title="Coming Soon"
        description="Tasting notes management will be available soon"
      />
    </div>
  );
}
