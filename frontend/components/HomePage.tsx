'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Coffee as CoffeeIcon, Star, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CoffeeCard } from '@/components/CoffeeCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Coffee, Review } from '@/types';
import { useAuth } from '@/hooks/useAuth';

// Composant pour la section Hero
const HeroSection = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;

    if (searchQuery.trim()) {
      window.location.href = `/coffees?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-coffee-50 via-cream-50 to-coffee-100 py-16 md:py-24">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-coffee-900 mb-6 leading-tight">
            Découvrez et partagez vos{' '}
            <span className="text-coffee-600">cafés préférés</span>
          </h1>

          <p className="text-lg md:text-xl text-coffee-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez la communauté Sipzy pour découvrir de nouveaux cafés,
            partager vos expériences et trouver votre prochaine tasse parfaite.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-coffee-400" />
              <Input
                name="search"
                type="search"
                placeholder="Rechercher un café, torréfacteur..."
                className="pl-12 pr-4 h-12 text-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Rechercher
              </Button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/coffees">
              <Button size="lg" className="w-full sm:w-auto">
                <CoffeeIcon className="mr-2 h-5 w-5" />
                Explorer les cafés
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Users className="mr-2 h-5 w-5" />
                  Rejoindre la communauté
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

// Composant pour les statistiques
const StatsSection = () => {
  const stats = [
    { icon: CoffeeIcon, label: 'Cafés référencés', value: '150+' },
    { icon: Users, label: 'Membres actifs', value: '500+' },
    { icon: Star, label: 'Avis publiés', value: '300+' },
    { icon: TrendingUp, label: 'Torréfacteurs', value: '50+' },
  ];

  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-coffee-100 rounded-lg mb-4">
                <stat.icon className="h-6 w-6 text-coffee-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-coffee-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-coffee-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

// Composant pour les cafés populaires
const PopularCoffeesSection = ({ coffees }: { coffees: Coffee[] }) => {
  return (
    <section className="py-16 bg-cream-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-900 mb-4">
            Cafés les mieux notés
          </h2>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            Découvrez les cafés préférés de notre communauté, 
            sélectionnés pour leur qualité exceptionnelle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {coffees.map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/coffees">
            <Button variant="outline" size="lg">
              Voir tous les cafés
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};

// Composant pour les avis récents
const RecentReviewsSection = ({ reviews }: { reviews: Review[] }) => {
  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-coffee-900 mb-4">
            Avis récents
          </h2>
          <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
            Découvrez les dernières expériences partagées par notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showCoffeeInfo={true}
              showActions={false}
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/coffees">
            <Button variant="outline" size="lg">
              Lire tous les avis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};

// Composant pour l'appel à l'action final
const CTASection = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  if (isAuthenticated) {
    // Si l'utilisateur est connecté, ne pas afficher cette section
    return null;
  }

  return (
    <section className="py-16 bg-coffee-900 text-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à rejoindre la communauté Sipzy ?
          </h2>
          <p className="text-lg text-cream-200 mb-8 leading-relaxed">
            Partagez vos découvertes, découvrez de nouveaux cafés et connectez-vous
            avec d'autres passionnés du café du monde entier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Users className="mr-2 h-5 w-5" />
                Créer un compte
              </Button>
            </Link>
            <Link href="/coffees/new">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-cream-300 text-cream-100 hover:bg-cream-100 hover:text-coffee-900">
                <CoffeeIcon className="mr-2 h-5 w-5" />
                Ajouter un café
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

// Props pour le composant HomePage
interface HomePageClientProps {
  popularCoffees: Coffee[];
  recentReviews: Review[];
  error?: string | null;
}

// Page d'accueil principale (Client Component)
export default function HomePageClient({ popularCoffees, recentReviews, error }: HomePageClientProps) {
  const { isAuthenticated } = useAuth();

  return (
    <PageLayout>
      <HeroSection isAuthenticated={isAuthenticated} />
      <StatsSection />

      {error ? (
        <section className="py-16 bg-cream-50">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <CoffeeIcon className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2">
                  Service temporairement ralenti
                </h3>
                <p className="text-amber-700 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  Rafraîchir la page
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <>
          <PopularCoffeesSection coffees={popularCoffees} />
          <RecentReviewsSection reviews={recentReviews} />
        </>
      )}

      <CTASection isAuthenticated={isAuthenticated} />
    </PageLayout>
  );
}