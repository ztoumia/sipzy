'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { CoffeeCard } from '@/components/CoffeeCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { favoritesApi } from '@/lib/api/favoritesApi';
import type { CoffeeResponse } from '@/lib/types/api';

export default function MyFavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<CoffeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attendre que l'auth soit chargée avant de rediriger
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile/favorites');
      return;
    }

    if (!user) return;

    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const response = await favoritesApi.getFavorites(1, 100); // Get first 100 favorites
        setFavorites(response.data);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user, isAuthenticated, authLoading, router]);

  // Recharger les favoris quand un favori est modifié
  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      const response = await favoritesApi.getFavorites(1, 100);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error reloading favorites:', error);
    }
  };

  // Afficher un loader pendant la vérification de l'auth
  if (authLoading) {
    return (
      <PageLayout>
        <Container className="py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes favoris</h1>
            <p className="text-gray-600">Les cafés que vous avez marqués comme favoris</p>
          </div>

          {/* Liste des favoris */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de vos favoris...</p>
              </div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun favori pour le moment
              </h2>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore ajouté de café à vos favoris.
                <br />
                Explorez notre catalogue et cliquez sur le cœur pour sauvegarder vos cafés préférés !
              </p>
              <Button href="/coffees">
                Découvrir des cafés
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compteur */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-red-800 font-medium flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  {favorites.length} café{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Grille de cafés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((coffee) => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
