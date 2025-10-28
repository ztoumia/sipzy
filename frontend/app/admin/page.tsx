'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Coffee, FileText, Users, Activity } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCards } from '@/components/admin/StatsCards';
import { CoffeeReviewQueue } from '@/components/admin/CoffeeReviewQueue';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, AdminStats } from '@/lib/api/adminApi';
import { Coffee as CoffeeType } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCoffees, setPendingCoffees] = useState<CoffeeType[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le rôle admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Charger les données du dashboard
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, activityData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingCoffees(1, 5),
        adminApi.getRecentActivity(10),
      ]);

      setStats(statsData);
      setPendingCoffees(pendingData.data);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
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

      // Recharger les données
      await loadDashboardData();
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

      // Recharger les données
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du café');
    }
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-coffee-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-coffee-900">
                Dashboard Admin
              </h1>
            </div>
            <p className="text-coffee-600">
              Bienvenue {user.username}, gérez la plateforme Sipzy
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/coffees">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-coffee-100 rounded-lg">
                      <Coffee className="h-5 w-5 text-coffee-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-900">Cafés</p>
                      <p className="text-sm text-coffee-600">Modération</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reports">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-900">Signalements</p>
                      <p className="text-sm text-coffee-600">À traiter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-900">Utilisateurs</p>
                      <p className="text-sm text-coffee-600">Gestion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/activity">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-900">Activité</p>
                      <p className="text-sm text-coffee-600">Logs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-10 w-10 bg-cream-200 rounded-lg"></div>
                      <div className="h-4 bg-cream-200 rounded w-20"></div>
                      <div className="h-8 bg-cream-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="mb-8">
              <StatsCards stats={stats} />
            </div>
          ) : null}

          {/* Cafés en attente */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-coffee-900">
                Cafés en attente de modération
              </h2>
              {pendingCoffees.length > 0 && (
                <Link href="/admin/coffees">
                  <Button variant="outline" size="sm">
                    Voir tous ({stats?.pendingCoffees})
                  </Button>
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
            ) : (
              <CoffeeReviewQueue
                coffees={pendingCoffees}
                onApprove={handleApproveCoffee}
                onReject={handleRejectCoffee}
              />
            )}
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="h-10 w-10 bg-cream-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-cream-200 rounded w-2/3"></div>
                        <div className="h-3 bg-cream-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-cream-200 last:border-0 last:pb-0">
                      <div className="p-2 bg-coffee-100 rounded-full flex-shrink-0">
                        <Coffee className="h-4 w-4 text-coffee-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-coffee-900 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-coffee-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-coffee-600 py-8">
                  Aucune activité récente
                </p>
              )}
            </CardContent>
          </Card>
        </Container>
      </div>
    </PageLayout>
  );
}
