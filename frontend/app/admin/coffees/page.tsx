'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Coffee, Filter, Search } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CoffeeReviewQueue } from '@/components/admin/CoffeeReviewQueue';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/api/adminApi';
import { Coffee as CoffeeType } from '@/types';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminCoffeesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [coffees, setCoffees] = useState<CoffeeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Vérifier le rôle admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Charger les cafés
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadCoffees();
    }
  }, [user, statusFilter, searchQuery, page]);

  const loadCoffees = async () => {
    setIsLoading(true);
    try {
      const filters = {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
      };

      const result = await adminApi.getAllCoffees(filters, page, 20);
      setCoffees(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Erreur lors du chargement des cafés:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCoffee = async (coffeeId: number, notes?: string) => {
    if (!user) return;

    try {
      await adminApi.approveCoffee({
        coffeeId,
        action: 'APPROVE',
        adminNotes: notes,
        adminId: user.id,
      });

      await loadCoffees();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation du café');
    }
  };

  const handleRejectCoffee = async (coffeeId: number, notes: string) => {
    if (!user) return;

    try {
      await adminApi.rejectCoffee({
        coffeeId,
        action: 'REJECT',
        adminNotes: notes,
        adminId: user.id,
      });

      await loadCoffees();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du café');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset à la page 1 lors de la recherche
  };

  const handleFilterChange = (newFilter: StatusFilter) => {
    setStatusFilter(newFilter);
    setPage(1); // Reset à la page 1 lors du changement de filtre
  };

  // Afficher un loader pendant la vérification auth
  if (authLoading || !user || user.role !== 'ADMIN') {
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
          {/* Breadcrumb */}
          <Link
            href="/admin"
            className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-coffee-600 rounded-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-coffee-900">
                Modération des Cafés
              </h1>
            </div>
            <p className="text-coffee-600">
              Gérez les propositions de cafés de la communauté
            </p>
          </div>

          {/* Filtres et recherche */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
                    <Input
                      type="search"
                      placeholder="Rechercher un café, origine, torréfacteur..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtres de statut */}
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('ALL')}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('PENDING')}
                    className={statusFilter === 'PENDING' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  >
                    En attente
                  </Button>
                  <Button
                    variant={statusFilter === 'APPROVED' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('APPROVED')}
                    className={statusFilter === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Approuvés
                  </Button>
                  <Button
                    variant={statusFilter === 'REJECTED' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('REJECTED')}
                    className={statusFilter === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Rejetés
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des cafés */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-cream-200 rounded w-1/3"></div>
                      <div className="h-4 bg-cream-200 rounded w-2/3"></div>
                      <div className="h-10 bg-cream-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statusFilter === 'PENDING' || statusFilter === 'ALL' ? (
            <CoffeeReviewQueue
              coffees={coffees.filter(c => statusFilter === 'ALL' || c.status === 'PENDING')}
              onApprove={handleApproveCoffee}
              onReject={handleRejectCoffee}
            />
          ) : (
            <div>
              {coffees.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-coffee-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                      Aucun café trouvé
                    </h3>
                    <p className="text-coffee-600">
                      Aucun café ne correspond à vos critères de recherche
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {coffees.map((coffee) => (
                    <Card key={coffee.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-coffee-900 mb-1">
                              {coffee.name}
                            </h3>
                            <p className="text-sm text-coffee-600 mb-2">
                              {coffee.roaster?.name} - {coffee.origin}
                            </p>
                            <div className="flex gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                coffee.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : coffee.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {coffee.status === 'APPROVED' ? 'Approuvé' : coffee.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                              </span>
                              {coffee.approvedAt && (
                                <span className="text-xs text-coffee-500">
                                  {new Date(coffee.approvedAt).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link href={`/coffees/${coffee.id}`} target="_blank">
                            <Button variant="outline" size="sm">
                              Voir détails
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Précédent
              </Button>

              <span className="text-sm text-coffee-600">
                Page {page} sur {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Suivant
              </Button>
            </div>
          )}
        </Container>
      </div>
    </PageLayout>
  );
}
