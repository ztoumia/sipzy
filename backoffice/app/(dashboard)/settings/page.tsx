'use client';

import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Configure admin panel settings"
      />

      <EmptyState
        icon={Settings}
        title="Coming Soon"
        description="Settings page will be available soon"
      />
    </div>
  );
}
