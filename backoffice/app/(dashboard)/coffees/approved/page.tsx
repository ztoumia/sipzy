'use client';

// Disable static generation for this redirect page
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ApprovedCoffeesPage() {
  useEffect(() => {
    redirect('/admin/coffees?status=APPROVED');
  }, []);

  return null;
}
