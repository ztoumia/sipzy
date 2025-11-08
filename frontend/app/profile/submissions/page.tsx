'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@sipzy/shared/components/ui/Card';
import { Badge } from '@sipzy/shared/components/ui/Badge';

// Simule les propositions de l'utilisateur
interface CoffeeSubmission {
  id: number;
  name: string;
  origin: string;
  roasterName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function MySubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<CoffeeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      localStorage.setItem('redirect_after_login', '/profile/submissions');
      router.push('/auth/login');
      return;
    }

    // Charger les propositions (simulation)
    const loadSubmissions = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Données mockées pour la démonstration
      const mockSubmissions: CoffeeSubmission[] = [
        {
          id: 1,
          name: 'Kenya AA Nyeri',
          origin: 'Kenya',
          roasterName: 'Coffee Collective',
          status: 'APPROVED',
          submittedAt: '2024-01-15T10:30:00Z',
          reviewedAt: '2024-01-16T14:20:00Z',
        },
        {
          id: 2,
          name: 'Guatemala Antigua SHB',
          origin: 'Guatemala',
          roasterName: 'La Cabra',
          status: 'PENDING',
          submittedAt: '2024-01-20T09:15:00Z',
        },
        {
          id: 3,
          name: 'Brazil Santos',
          origin: 'Brazil',
          roasterName: 'Tim Wendelboe',
          status: 'REJECTED',
          submittedAt: '2024-01-10T16:45:00Z',
          reviewedAt: '2024-01-12T11:30:00Z',
          rejectionReason: 'Informations incomplètes sur le processus de traitement',
        },
      ];

      setSubmissions(mockSubmissions);
      setIsLoading(false);
    };

    loadSubmissions();
  }, [router]);

  const getStatusBadge = (status: CoffeeSubmission['status']) => {
    const config = {
      PENDING: {
        variant: 'default' as const,
        icon: Clock,
        label: 'En attente',
      },
      APPROVED: {
        variant: 'success' as const,
        icon: CheckCircle,
        label: 'Approuvé',
      },
      REJECTED: {
        variant: 'danger' as const,
        icon: XCircle,
        label: 'Rejeté',
      },
    };

    const { variant, icon: Icon, label } = config[status];

    return (
      <Badge variant={variant} className="inline-flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="bg-cream-50 py-16">
          <Container>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto"></div>
              <p className="mt-4 text-coffee-600">Chargement de vos propositions...</p>
            </div>
          </Container>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container>
          {/* Header de la page */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-coffee-900 mb-2">
                Mes propositions de cafés
              </h1>
              <p className="text-coffee-600">
                Suivez l&apos;état de vos soumissions et proposez de nouveaux cafés
              </p>
            </div>
            <Link href="/coffees/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Proposer un café
              </Button>
            </Link>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-coffee-900 mb-1">
                    {submissions.length}
                  </div>
                  <div className="text-sm text-coffee-600">Total</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {submissions.filter(s => s.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-coffee-600">En attente</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {submissions.filter(s => s.status === 'APPROVED').length}
                  </div>
                  <div className="text-sm text-coffee-600">Approuvés</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des propositions */}
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-coffee-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                  Aucune proposition pour le moment
                </h3>
                <p className="text-coffee-600 mb-6">
                  Commencez par proposer votre premier café à la communauté
                </p>
                <Link href="/coffees/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Proposer un café
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-coffee-900">
                            {submission.name}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>

                        <div className="space-y-1 text-sm text-coffee-600">
                          <p>
                            <span className="font-medium">Origine:</span> {submission.origin}
                          </p>
                          <p>
                            <span className="font-medium">Torréfacteur:</span> {submission.roasterName}
                          </p>
                          <p>
                            <span className="font-medium">Soumis le:</span> {formatDate(submission.submittedAt)}
                          </p>
                          {submission.reviewedAt && (
                            <p>
                              <span className="font-medium">
                                {submission.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'} le:
                              </span>{' '}
                              {formatDate(submission.reviewedAt)}
                            </p>
                          )}
                        </div>

                        {submission.status === 'REJECTED' && submission.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Raison du rejet:</span>{' '}
                              {submission.rejectionReason}
                            </p>
                          </div>
                        )}

                        {submission.status === 'PENDING' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Votre proposition est en cours d&apos;examen par nos modérateurs.
                              Vous recevrez une notification une fois la révision terminée.
                            </p>
                          </div>
                        )}

                        {submission.status === 'APPROVED' && (
                          <div className="mt-4">
                            <Link href={`/coffees/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                Voir la fiche café
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </div>
    </PageLayout>
  );
}
