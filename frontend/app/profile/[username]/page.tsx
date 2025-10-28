'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Coffee as CoffeeIcon, MessageSquare } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { CoffeeCard } from '@/components/CoffeeCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { profileApi, UserProfile } from '@/lib/api/profileApi';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'coffees'>('reviews');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const data = await profileApi.getUserProfile(username);
      setProfile(data);
      setIsLoading(false);
    };

    loadProfile();
  }, [username]);

  if (isLoading) {
    return (
      <PageLayout>
        <Container className="py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du profil...</p>
            </div>
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout>
        <Container className="py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Utilisateur introuvable</h1>
            <p className="text-gray-600 mb-6">
              L'utilisateur @{username} n'existe pas ou a été supprimé.
            </p>
            <Button href="/">Retour à l'accueil</Button>
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="space-y-8">
          {/* En-tête du profil */}
          <ProfileHeader user={profile.user} isOwnProfile={isOwnProfile} />

          {/* Statistiques */}
          <ProfileStats stats={profile.stats} />

          {/* Onglets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Navigation des onglets */}
            <div className="border-b border-gray-200">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'reviews'
                      ? 'border-coffee-600 text-coffee-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Avis ({profile.stats.totalReviews})
                </button>
                <button
                  onClick={() => setActiveTab('coffees')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'coffees'
                      ? 'border-coffee-600 text-coffee-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <CoffeeIcon className="w-4 h-4" />
                  Cafés soumis ({profile.stats.totalCoffeesSubmitted})
                </button>
              </div>
            </div>

            {/* Contenu des onglets */}
            <div className="p-6">
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {profile.recentReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        {isOwnProfile
                          ? "Vous n'avez pas encore publié d'avis"
                          : "Aucun avis publié pour l'instant"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {profile.recentReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                      {profile.stats.totalReviews > profile.recentReviews.length && (
                        <div className="text-center pt-4">
                          <Button
                            href={`/profile/${username}/reviews`}
                            variant="outline"
                          >
                            Voir tous les avis
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'coffees' && (
                <div>
                  {profile.approvedCoffees.length === 0 ? (
                    <div className="text-center py-12">
                      <CoffeeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        {isOwnProfile
                          ? "Vous n'avez pas encore soumis de café"
                          : "Aucun café soumis pour l'instant"}
                      </p>
                      {isOwnProfile && (
                        <Button href="/coffees/new" className="mt-4">
                          Soumettre un café
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profile.approvedCoffees.map((coffee) => (
                          <CoffeeCard key={coffee.id} coffee={coffee} />
                        ))}
                      </div>
                      {profile.stats.totalCoffeesSubmitted > profile.approvedCoffees.length && (
                        <div className="text-center pt-6">
                          <Button
                            href={`/profile/${username}/coffees`}
                            variant="outline"
                          >
                            Voir tous les cafés
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
