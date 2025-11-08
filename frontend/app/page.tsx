import api from '@/lib/api/realApi';
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
  // Récupérer les données côté serveur avec gestion d'erreur
  let popularCoffees: any[] = [];
  let recentReviews: any[] = [];
  let error: string | null = null;

  try {
    popularCoffees = await api.coffees.getPopular(8);
    recentReviews = await api.reviews.getRecent(6);
  } catch (err: any) {
    console.error('[HomePage] Error fetching data:', err.message);
    error = err.response?.status === 429
      ? 'Trop de requêtes. Veuillez rafraîchir la page dans quelques instants.'
      : 'Erreur lors du chargement des données.';
  }

  // Passer les données au Client Component
  return (
    <HomePageClient
      popularCoffees={popularCoffees}
      recentReviews={recentReviews}
      error={error}
    />
  );
}