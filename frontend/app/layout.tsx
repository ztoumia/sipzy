import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from './providers';
import { NavigationLoader } from '@/components/common/NavigationLoader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Sipzy - Découvrez et partagez vos cafés préférés',
  description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés. Rejoignez notre communauté de passionnés !',
  keywords: ['café', 'coffee', 'spécialisé', 'avis', 'communauté', 'torréfacteur', 'dégustation'],
  authors: [{ name: 'Sipzy Team' }],
  creator: 'Sipzy',
  publisher: 'Sipzy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sipzy.coffee'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sipzy - Découvrez et partagez vos cafés préférés',
    description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés.',
    url: 'https://sipzy.coffee',
    siteName: 'Sipzy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sipzy - Plateforme communautaire de café',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sipzy - Découvrez et partagez vos cafés préférés',
    description: 'La plateforme communautaire pour découvrir, noter et partager vos expériences autour des cafés spécialisés.',
    images: ['/og-image.jpg'],
    creator: '@sipzy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
