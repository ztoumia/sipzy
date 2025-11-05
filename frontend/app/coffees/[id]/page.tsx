import React from 'react';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Coffee as CoffeeIcon,
  MessageCircle,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import { PageLayoutServer } from '@/components/layout/PageLayoutServer';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import AddReviewButton from '@/components/AddReviewButton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/ReviewCard';
import { CoffeeCard } from '@/components/CoffeeCard';
import api from '@/lib/api/realApi';
import { Coffee } from '@/types';

// Composant pour les informations du café
const CoffeeInfo = ({ coffee }: { coffee: Coffee }) => {
  const formatPriceRange = (priceRange?: string) => {
    if (!priceRange) return 'Non spécifié';
    
    const priceMap: Record<string, string> = {
      '€': '€ (Économique)',
      '€€': '€€ (Modéré)',
      '€€€': '€€€ (Élevé)',
      '€€€€': '€€€€ (Premium)',
    };
    
    return priceMap[priceRange] || priceRange;
  };

  const formatAltitude = (min?: number, max?: number) => {
    if (!min && !max) return 'Non spécifié';
    if (min && max) return `${min} - ${max} m`;
    if (min) return `${min}+ m`;
    if (max) return `Jusqu'à ${max} m`;
    return 'Non spécifié';
  };

  return (
    <div className="space-y-6">
      {/* Image principale */}
      <div className="relative aspect-square lg:aspect-video overflow-hidden rounded-xl">
        {coffee.imageUrl ? (
          <Image
            src={coffee.imageUrl}
            alt={coffee.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream-100">
            <CoffeeIcon className="h-16 w-16 text-coffee-400" />
          </div>
        )}
      </div>

      {/* Informations principales */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-coffee-900 mb-2">
              {coffee.name}
            </h1>
            {coffee.roaster && (
              <p className="text-xl text-coffee-600 mb-4">
                par{' '}
                <Link 
                  href={`/coffees?roaster=${coffee.roaster.id}`}
                  className="hover:text-coffee-800 transition-colors"
                >
                  {coffee.roaster.name}
                </Link>
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Rating et stats */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <StarRating rating={coffee.avgRating} size="lg" interactive={false} />
            <span className="text-2xl font-bold text-coffee-900">
              {coffee.avgRating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-coffee-600">
            <MessageCircle className="h-4 w-4" />
            <span>{coffee.reviewCount} avis</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {coffee.origin && (
            <Badge variant="outline" size="lg">
              <MapPin className="mr-1 h-3 w-3" />
              {coffee.origin}
            </Badge>
          )}
          {coffee.process && (
            <Badge variant="secondary" size="lg">
              {coffee.process}
            </Badge>
          )}
          {coffee.variety && (
            <Badge variant="outline" size="lg">
              {coffee.variety}
            </Badge>
          )}
          {coffee.priceRange && (
            <Badge variant="default" size="lg">
              {formatPriceRange(coffee.priceRange)}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {coffee.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-coffee-800 leading-relaxed">
              {coffee.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Détails techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Détails techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coffee.altitudeMin && coffee.altitudeMax && (
              <div>
                <h4 className="font-medium text-coffee-900 mb-1">Altitude</h4>
                <p className="text-coffee-600">{formatAltitude(coffee.altitudeMin, coffee.altitudeMax)}</p>
              </div>
            )}
            
            {coffee.harvestYear && (
              <div>
                <h4 className="font-medium text-coffee-900 mb-1">Récolte</h4>
                <p className="text-coffee-600">{coffee.harvestYear}</p>
              </div>
            )}
            
            {coffee.submittedByUser && (
              <div>
                <h4 className="font-medium text-coffee-900 mb-1">Ajouté par</h4>
                <Link 
                  href={`/profile/${coffee.submittedByUser.username}`}
                  className="text-coffee-600 hover:text-coffee-800 transition-colors"
                >
                  {coffee.submittedByUser.username}
                </Link>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-coffee-900 mb-1">Ajouté le</h4>
              <p className="text-coffee-600">
                {new Date(coffee.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes aromatiques */}
      {coffee.notes && coffee.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notes aromatiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {coffee.notes.map((note) => (
                <Badge key={note.id} variant="outline" size="lg">
                  {note.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Composant pour les avis
const ReviewsSection = async ({ coffeeId }: { coffeeId: number }) => {
  const reviewsResult = await api.reviews.getByCoffeeId(coffeeId, 1, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-coffee-900">
          Avis ({reviewsResult.pagination.total})
        </h2>
        <AddReviewButton coffeeId={coffeeId} />
      </div>

      {reviewsResult.data.length === 0 ? (
        <Card>
            <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-coffee-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-coffee-900 mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-coffee-600 mb-4">
              Soyez le premier à partager votre expérience avec ce café !
            </p>
            <div className="flex justify-center">
              <AddReviewButton coffeeId={coffeeId} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewsResult.data.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showCoffeeInfo={false}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour les cafés similaires
const SimilarCoffees = async ({ coffeeId }: { coffeeId: number }) => {
  const similarCoffees = await api.coffees.getSimilar(coffeeId, 4);

  if (similarCoffees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-coffee-900">
        Cafés similaires
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarCoffees.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>
    </div>
  );
};

// Page principale
export default async function CoffeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coffeeId = parseInt(id);
  
  if (isNaN(coffeeId)) {
    notFound();
  }

  const coffee = await api.coffees.getById(coffeeId);

  if (!coffee) {
    notFound();
  }

  return (
    <PageLayoutServer>
      <div className="bg-cream-50 py-8">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-coffee-600 mb-6">
            <Link href="/" className="hover:text-coffee-800 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/coffees" className="hover:text-coffee-800 transition-colors">
              Cafés
            </Link>
            <span>/</span>
            <span className="text-coffee-900">{coffee.name}</span>
          </nav>

          {/* Bouton retour */}
          <Link href="/coffees" className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cafés
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
                <CoffeeInfo coffee={coffee} />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AddReviewButton coffeeId={coffeeId} />
                  <Button variant="outline" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    Ajouter aux favoris
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                </CardContent>
              </Card>

              {/* Stats rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-coffee-600">Note moyenne</span>
                      <span className="font-semibold">{coffee.avgRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coffee-600">Nombre d'avis</span>
                      <span className="font-semibold">{coffee.reviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coffee-600">Ajouté le</span>
                      <span className="font-semibold">
                        {new Date(coffee.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section avis */}
          <div className="mt-12">
            <Suspense fallback={<div className="skeleton h-64 rounded-lg" />}>
              <ReviewsSection coffeeId={coffeeId} />
            </Suspense>
          </div>

          {/* Cafés similaires */}
          <div className="mt-12">
            <Suspense fallback={<div className="skeleton h-64 rounded-lg" />}>
              <SimilarCoffees coffeeId={coffeeId} />
            </Suspense>
          </div>
        </Container>
      </div>
    </PageLayoutServer>
  );
}

// Métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coffeeId = parseInt(id);
  const coffee = await coffeeApi.getCoffeeById(coffeeId);

  if (!coffee) {
    return {
      title: 'Café non trouvé - Sipzy',
    };
  }

  const title = `${coffee.name} par ${coffee.roaster?.name || 'Torréfacteur inconnu'} - Sipzy`;
  const description = coffee.description || `Découvrez ${coffee.name}, un café ${coffee.origin ? `d'${coffee.origin}` : ''} avec une note de ${coffee.avgRating.toFixed(1)}/5. Lisez les avis de notre communauté.`;

  return {
    title,
    description,
    keywords: [
      coffee.name,
      coffee.roaster?.name,
      coffee.origin,
      coffee.process,
      'café spécialisé',
      'avis café',
      'dégustation',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://sipzy.coffee/coffees/${coffee.id}`,
      images: coffee.imageUrl ? [
        {
          url: coffee.imageUrl,
          width: 1200,
          height: 630,
          alt: coffee.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coffee.imageUrl ? [coffee.imageUrl] : [],
    },
  };
}
