import { coffeeApi, reviewApi } from '@/lib/api/mockApi';
import HomePageClient from '@/components/HomePage';

// Métadonnées pour le SEO - fonctionne uniquement dans Server Components
export const metadata = {
  title: 'Sipzy - Découvrez et partagez vos cafés préférés',
  description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés. Rejoignez notre communauté de passionnés !',
  keywords: ['café', 'coffee', 'spécialisé', 'avis', 'communauté', 'torréfacteur', 'dégustation'],
  openGraph: {
    title: 'Sipzy - Découvrez et partagez vos cafés préférés',
    description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés.',
    type: 'website',
    url: 'https://sipzy.coffee',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sipzy - Découvrez et partagez vos cafés préférés',
    description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés.',
  },
};

export default async function HomePage() {
  // Récupérer les données côté serveur
  const popularCoffees = await coffeeApi.getPopularCoffees(8);
  const recentReviews = await reviewApi.getRecentReviews(6);

  // Passer les données au Client Component
  return (
    <HomePageClient 
      popularCoffees={popularCoffees} 
      recentReviews={recentReviews} 
    />
  );
}