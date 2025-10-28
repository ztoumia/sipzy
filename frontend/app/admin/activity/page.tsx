'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminActivityPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-coffee-800 mb-2">Journal d'Activité</h1>
            <p className="text-coffee-600">Consultez l'historique des activités admin</p>
          </div>

          <div className="bg-white border-2 border-coffee-200 rounded-lg p-8 text-center">
            <Activity className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-coffee-800 mb-2">Page en construction</h2>
            <p className="text-coffee-600 mb-6">
              Cette fonctionnalité sera bientôt disponible.
            </p>
            <Link href="/admin">
              <Button>Retour au Dashboard</Button>
            </Link>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}
