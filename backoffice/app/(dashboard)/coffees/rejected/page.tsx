'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RejectedCoffeesPage() {
  useEffect(() => {
    redirect('/admin/coffees?status=REJECTED');
  }, []);

  return null;
}
