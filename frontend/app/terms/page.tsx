'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container size="md">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Conditions Générales d&apos;Utilisation</CardTitle>
              <p className="text-coffee-600 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </CardHeader>

            <CardContent className="prose prose-coffee max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">1. Objet</h2>
                <p className="text-coffee-700 mb-4">
                  Les présentes conditions générales d&apos;utilisation (ci-après « CGU ») ont pour objet de définir
                  les modalités et conditions d&apos;utilisation de la plateforme Sipzy.coffee (ci-après « la Plateforme »),
                  ainsi que les droits et obligations des utilisateurs.
                </p>
                <p className="text-coffee-700">
                  L&apos;utilisation de la Plateforme implique l&apos;acceptation pleine et entière des présentes CGU.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">2. Accès à la Plateforme</h2>
                <p className="text-coffee-700 mb-4">
                  La Plateforme est accessible gratuitement à tout utilisateur disposant d&apos;un accès à Internet.
                  Tous les coûts afférents à l&apos;accès à la Plateforme, que ce soient les frais matériels,
                  logiciels ou d&apos;accès à Internet sont exclusivement à la charge de l&apos;utilisateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">3. Création de compte</h2>
                <p className="text-coffee-700 mb-4">
                  Pour accéder à certaines fonctionnalités de la Plateforme (ajouter des avis, proposer des cafés),
                  l&apos;utilisateur doit créer un compte en fournissant :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Un nom d&apos;utilisateur unique</li>
                  <li>Une adresse email valide</li>
                  <li>Un mot de passe sécurisé</li>
                </ul>
                <p className="text-coffee-700">
                  L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour.
                  Il est responsable de la confidentialité de ses identifiants de connexion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">4. Contenu utilisateur</h2>
                <p className="text-coffee-700 mb-4">
                  L&apos;utilisateur peut publier du contenu sur la Plateforme (avis, commentaires, propositions de cafés).
                  En publiant du contenu, l&apos;utilisateur :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Garantit être titulaire des droits nécessaires sur le contenu publié</li>
                  <li>Accorde à Sipzy une licence non-exclusive pour afficher et diffuser ce contenu</li>
                  <li>S&apos;engage à ne pas publier de contenu illégal, diffamatoire, ou portant atteinte aux droits de tiers</li>
                  <li>S&apos;engage à ne pas publier de spam ou de contenu publicitaire non sollicité</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">5. Modération</h2>
                <p className="text-coffee-700 mb-4">
                  Sipzy se réserve le droit de modérer, modifier ou supprimer tout contenu qui :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Ne respecte pas les présentes CGU</li>
                  <li>Est signalé par d&apos;autres utilisateurs comme inapproprié</li>
                  <li>Porte atteinte aux droits de tiers</li>
                  <li>Est contraire à la loi ou aux bonnes mœurs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">6. Propriété intellectuelle</h2>
                <p className="text-coffee-700 mb-4">
                  La structure générale de la Plateforme, ainsi que les textes, graphiques, images, sons et vidéos
                  la composant sont la propriété de Sipzy ou de ses partenaires.
                </p>
                <p className="text-coffee-700">
                  Toute représentation et/ou reproduction et/ou exploitation partielle ou totale des contenus et
                  services proposés par la Plateforme, par quelque procédé que ce soit, sans l&apos;autorisation préalable
                  et par écrit de Sipzy est strictement interdite.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">7. Limitation de responsabilité</h2>
                <p className="text-coffee-700 mb-4">
                  Sipzy ne saurait être tenue responsable :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Des interruptions ou dysfonctionnements de la Plateforme</li>
                  <li>De l&apos;exactitude des informations fournies par les utilisateurs</li>
                  <li>Des dommages directs ou indirects résultant de l&apos;utilisation de la Plateforme</li>
                  <li>Du contenu des sites tiers vers lesquels la Plateforme pourrait renvoyer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">8. Modification des CGU</h2>
                <p className="text-coffee-700">
                  Sipzy se réserve le droit de modifier les présentes CGU à tout moment.
                  Les utilisateurs seront informés de toute modification par email et/ou notification sur la Plateforme.
                  La poursuite de l&apos;utilisation de la Plateforme après modification vaut acceptation des nouvelles CGU.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">9. Droit applicable et juridiction</h2>
                <p className="text-coffee-700">
                  Les présentes CGU sont régies par le droit français.
                  En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">10. Contact</h2>
                <p className="text-coffee-700">
                  Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l&apos;adresse :
                  <a href="mailto:legal@sipzy.coffee" className="text-coffee-600 hover:text-coffee-800 ml-1">
                    legal@sipzy.coffee
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </Container>
      </div>
    </PageLayout>
  );
}
