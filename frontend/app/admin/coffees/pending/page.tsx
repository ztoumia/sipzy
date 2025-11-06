'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingCoffeesPage() {
  useEffect(() => {
    // Redirect to main coffees page with PENDING filter
    redirect('/admin/coffees?status=PENDING');
  }, []);

  return null;
}
