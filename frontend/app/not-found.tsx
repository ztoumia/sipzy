import React from 'react';
import Link from 'next/link';
import { Coffee, Home } from 'lucide-react';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Container } from '@/components/layout/Container';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-cream-50 to-coffee-100 flex items-center justify-center">
      <Container size="sm">
        <div className="text-center">
          {/* Icône */}
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-coffee-100 rounded-full">
              <Coffee className="h-16 w-16 text-coffee-600" />
            </div>
          </div>

          {/* Message d'erreur */}
          <h1 className="text-6xl md:text-8xl font-bold text-coffee-900 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-coffee-800 mb-4">
            Page non trouvée
          </h2>
          
          <p className="text-lg text-coffee-600 mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Peut-être cherchiez-vous un café en particulier ?
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Button>
            </Link>
            
            <Link href="/coffees">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Coffee className="mr-2 h-5 w-5" />
                Découvrir les cafés
              </Button>
            </Link>
          </div>

          {/* Suggestion de recherche */}
          <div className="mt-12 p-6 bg-white rounded-lg border border-cream-200">
            <h3 className="text-lg font-semibold text-coffee-900 mb-3">
              Que souhaitez-vous faire ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link 
                href="/coffees" 
                className="p-3 rounded-lg border border-cream-200 hover:bg-cream-50 transition-colors text-coffee-700 hover:text-coffee-900"
              >
                🔍 Découvrir des cafés
              </Link>
              <Link 
                href="/coffees/new" 
                className="p-3 rounded-lg border border-cream-200 hover:bg-cream-50 transition-colors text-coffee-700 hover:text-coffee-900"
              >
                ➕ Ajouter un café
              </Link>
              <Link 
                href="/auth/register" 
                className="p-3 rounded-lg border border-cream-200 hover:bg-cream-50 transition-colors text-coffee-700 hover:text-coffee-900"
              >
                👥 Rejoindre la communauté
              </Link>
              <Link 
                href="/about" 
                className="p-3 rounded-lg border border-cream-200 hover:bg-cream-50 transition-colors text-coffee-700 hover:text-coffee-900"
              >
                ℹ️ En savoir plus
              </Link>
            </div>
          </div>

          {/* Message d'encouragement */}
          <div className="mt-8 text-sm text-coffee-500">
            <p>
              Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à{' '}
              <Link href="/contact" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                nous contacter
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
