'use client';

import { BarChart } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart}
        title="Analytics"
        description="View platform statistics and insights"
      />

      <EmptyState
        icon={BarChart}
        title="Coming Soon"
        description="Analytics dashboard will be available soon"
      />
    </div>
  );
}
