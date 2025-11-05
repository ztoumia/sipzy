'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  dataManagementApi,
  EntityMetadata,
  EntityDataResponse,
  FieldMetadata,
} from '@/lib/api/dataManagementApi';
import { EntityEditModal } from '@/components/admin/EntityEditModal';

export default function EntityTablePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();

  const entityType = params.entityType as string;

  const [metadata, setMetadata] = useState<EntityMetadata | null>(null);
  const [data, setData] = useState<EntityDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingEntity, setEditingEntity] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Vérifier le rôle admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Charger les métadonnées et les données
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadMetadata();
      loadData();
    }
  }, [user, entityType, currentPage, pageSize, sortBy, sortDirection]);

  const loadMetadata = async () => {
    try {
      const entities = await dataManagementApi.getEntityMetadata();
      const entityMetadata = entities.find((e) => e.name === entityType);
      if (entityMetadata) {
        setMetadata(entityMetadata);
      } else {
        setError('Table non trouvée');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des métadonnées:', err);
      setError('Impossible de charger les métadonnées');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dataManagementApi.getEntityData(entityType, {
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDirection,
      });
      setData(result);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (entity: any) => {
    setEditingEntity(entity);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updates: Record<string, any>) => {
    if (!editingEntity) return;

    try {
      await dataManagementApi.updateEntity(entityType, editingEntity.id, updates);
      setIsEditModalOpen(false);
      setEditingEntity(null);
      await loadData();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      await dataManagementApi.deleteEntity(entityType, id);
      await loadData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const formatValue = (value: any, field: FieldMetadata): string => {
    if (value == null) return '-';

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleString('fr-FR');
      case 'boolean':
        return value ? 'Oui' : 'Non';
      case 'relation':
        // For relations, the value might be an ID or object
        return value.toString();
      default:
        return value.toString();
    }
  };

  const handleSort = (fieldName: string) => {
    if (sortBy === fieldName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(fieldName);
      setSortDirection('asc');
    }
    setCurrentPage(0);
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

  if (!metadata) {
    return (
      <PageLayout>
        <Container className="py-8">
          <div className="text-center">
            <p className="text-gray-600">Chargement...</p>
          </div>
        </Container>
      </PageLayout>
    );
  }

  // Get visible fields (exclude some technical fields from display)
  const visibleFields = metadata.fields.filter(
    (f) =>
      !f.name.includes('Token') &&
      !f.name.includes('password') &&
      !f.name.includes('Hash')
  );

  // Limit displayed fields for better UX
  const displayFields = visibleFields.slice(0, 8);

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="mb-6">
          <Link
            href="/admin/data"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux tables
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {metadata.displayName}
              </h1>
              <p className="text-gray-600 mt-1">
                Table: {metadata.tableName} • {data?.totalElements || 0} entrées
              </p>
            </div>

            <Button
              onClick={loadData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des données...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {displayFields.map((field) => (
                          <th
                            key={field.name}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort(field.name)}
                          >
                            <div className="flex items-center gap-2">
                              {field.displayName}
                              {sortBy === field.name && (
                                <span className="text-amber-600">
                                  {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.data.map((row: any) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {displayFields.map((field) => (
                            <td
                              key={field.name}
                              className="px-4 py-3 text-sm text-gray-900"
                            >
                              <div className="max-w-xs truncate">
                                {formatValue(row[field.name], field)}
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(row)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage + 1} sur {data.totalPages} •{' '}
                      {data.totalElements} entrées au total
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= data.totalPages - 1}
                        variant="outline"
                        size="sm"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Edit Modal */}
      {isEditModalOpen && editingEntity && metadata && (
        <EntityEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEntity(null);
          }}
          entity={editingEntity}
          metadata={metadata}
          onSave={handleSave}
        />
      )}
    </PageLayout>
  );
}
