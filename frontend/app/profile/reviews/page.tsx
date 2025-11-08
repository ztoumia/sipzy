'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@sipzy/shared/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { profileApi } from '@/lib/api/profileApi';
import { Review } from '@sipzy/shared/types';

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile/reviews');
      return;
    }

    if (!user) return;

    const loadReviews = async () => {
      setIsLoading(true);
      const data = await profileApi.getUserReviews(user.username, page, 10);

      if (page === 1) {
        setReviews(data);
      } else {
        setReviews((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 10);
      setIsLoading(false);
    };

    loadReviews();
  }, [user, isAuthenticated, router, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes avis</h1>
            <p className="text-gray-600">Tous les avis que vous avez publiés sur des cafés</p>
          </div>

          {/* Liste des avis */}
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de vos avis...</p>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun avis publié
              </h2>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore publié d'avis sur des cafés.
              </p>
              <Link href="/coffees">
                <Button>
                  Découvrir des cafés
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compteur */}
              <div className="bg-coffee-50 rounded-lg p-4 border border-coffee-200">
                <p className="text-coffee-800 font-medium">
                  {reviews.length} avis publiés{hasMore ? ' (chargés)' : ' au total'}
                </p>
              </div>

              {/* Avis */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Bouton charger plus */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-600 mr-2"></div>
                        Chargement...
                      </>
                    ) : (
                      'Charger plus d\'avis'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
