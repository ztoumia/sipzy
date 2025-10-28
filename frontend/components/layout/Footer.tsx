import React from 'react';
import Link from 'next/link';
import { Coffee, Mail, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-coffee-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-cream-200" />
              <span className="text-xl font-bold">Sipzy</span>
            </Link>
            <p className="text-cream-200 mb-4 max-w-md">
              La plateforme communautaire pour découvrir, noter et partager vos expériences 
              autour des cafés spécialisés. Rejoignez notre communauté de passionnés !
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/sipzy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-200 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/sipzy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-200 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@sipzy.coffee"
                className="text-cream-200 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/coffees"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  Découvrir les cafés
                </Link>
              </li>
              <li>
                <Link
                  href="/coffees/new"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  Ajouter un café
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-cream-200 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-coffee-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cream-200 text-sm">
              © 2024 Sipzy. Tous droits réservés.
            </p>
            <p className="text-cream-200 text-sm mt-2 md:mt-0">
              Fait avec ❤️ pour les amateurs de café
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
