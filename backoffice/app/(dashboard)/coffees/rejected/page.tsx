'use client';

// Disable static generation for this redirect page
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RejectedCoffeesPage() {
  useEffect(() => {
    redirect('/admin/coffees?status=REJECTED');
  }, []);

  return null;
}
