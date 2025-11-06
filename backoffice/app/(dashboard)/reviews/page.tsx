'use client';

import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquare}
        title="Reviews Moderation"
        description="Manage and moderate user reviews"
      />

      <EmptyState
        icon={MessageSquare}
        title="Coming Soon"
        description="Reviews moderation will be available soon"
      />
    </div>
  );
}
