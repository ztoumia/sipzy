'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database, Table as TableIcon, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { dataManagementApi, EntityMetadata } from '@/lib/api/dataManagementApi';

export default function DataManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [entities, setEntities] = useState<EntityMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le rôle admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Charger les métadonnées des entités
  useEffect(() => {
    let isMounted = true;

    if (user && user.role === 'ADMIN' && isMounted) {
      loadEntities();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]); // Only re-run if user ID or role changes

  const loadEntities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataManagementApi.getEntityMetadata();
      setEntities(data);
    } catch (err) {
      console.error('Erreur lors du chargement des entités:', err);
      setError('Impossible de charger les tables. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant la vérification auth
  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Données</h1>
          </div>
          <p className="text-gray-600">
            Visualisez et modifiez toutes les tables de la base de données
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des tables...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <Link
                key={entity.name}
                href={`/admin/data/${entity.name}`}
                className="block group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:border-amber-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <TableIcon className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {entity.displayName}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {entity.tableName}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {entity.fields.length} champs
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {entity.fields.slice(0, 4).map((field) => (
                          <span
                            key={field.name}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {field.displayName}
                          </span>
                        ))}
                        {entity.fields.length > 4 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{entity.fields.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && entities.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune table disponible</p>
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
