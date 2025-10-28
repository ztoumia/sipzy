'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PrivacyPage() {
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
              <CardTitle className="text-3xl">Politique de Confidentialité</CardTitle>
              <p className="text-coffee-600 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </CardHeader>

            <CardContent className="prose prose-coffee max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">1. Introduction</h2>
                <p className="text-coffee-700 mb-4">
                  La présente politique de confidentialité a pour objectif de vous informer sur la manière dont
                  Sipzy.coffee (ci-après « nous », « notre » ou « Sipzy ») collecte, utilise et protège vos données
                  personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">2. Responsable du traitement</h2>
                <p className="text-coffee-700 mb-4">
                  Le responsable du traitement des données est :
                </p>
                <div className="bg-cream-50 p-4 rounded-lg text-coffee-700">
                  <p><strong>Sipzy.coffee</strong></p>
                  <p>Email : privacy@sipzy.coffee</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">3. Données collectées</h2>
                <p className="text-coffee-700 mb-4">
                  Nous collectons les données suivantes lorsque vous utilisez notre plateforme :
                </p>

                <h3 className="text-xl font-semibold text-coffee-900 mb-3">3.1 Données fournies par l&apos;utilisateur</h3>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Lors de l&apos;inscription :</strong> nom d&apos;utilisateur, adresse email, mot de passe (crypté)</li>
                  <li><strong>Lors de l&apos;utilisation :</strong> avis, commentaires, notes, photos de cafés</li>
                  <li><strong>Profil utilisateur :</strong> photo de profil, biographie (optionnel)</li>
                </ul>

                <h3 className="text-xl font-semibold text-coffee-900 mb-3">3.2 Données collectées automatiquement</h3>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et version</li>
                  <li>Pages visitées et durée de visite</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">4. Finalités du traitement</h2>
                <p className="text-coffee-700 mb-4">
                  Vos données personnelles sont utilisées pour :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Vous permettre de publier des avis et proposer des cafés</li>
                  <li>Améliorer nos services et l&apos;expérience utilisateur</li>
                  <li>Assurer la sécurité de la plateforme et prévenir les abus</li>
                  <li>Vous envoyer des notifications importantes concernant votre compte</li>
                  <li>Répondre à vos demandes et questions</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">5. Base légale du traitement</h2>
                <p className="text-coffee-700 mb-4">
                  Le traitement de vos données personnelles repose sur :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Votre consentement</strong> lors de la création de votre compte</li>
                  <li><strong>L&apos;exécution du contrat</strong> (CGU) vous liant à Sipzy</li>
                  <li><strong>Nos intérêts légitimes</strong> pour améliorer nos services</li>
                  <li><strong>Le respect d&apos;obligations légales</strong> (conservation de données, lutte contre la fraude)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">6. Partage des données</h2>
                <p className="text-coffee-700 mb-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Prestataires de services :</strong> hébergement (Vercel), stockage d&apos;images (Cloudinary)</li>
                  <li><strong>Autorités légales :</strong> si requis par la loi ou pour protéger nos droits</li>
                  <li><strong>Autres utilisateurs :</strong> contenu que vous publiez publiquement (avis, profil)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">7. Durée de conservation</h2>
                <p className="text-coffee-700 mb-4">
                  Nous conservons vos données personnelles :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Compte actif :</strong> pendant toute la durée d&apos;utilisation de votre compte</li>
                  <li><strong>Compte supprimé :</strong> 30 jours après suppression (délai de rétractation)</li>
                  <li><strong>Données de connexion :</strong> 12 mois (obligation légale)</li>
                  <li><strong>Avis publiés :</strong> anonymisés après suppression du compte</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">8. Vos droits</h2>
                <p className="text-coffee-700 mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong>Droit à l&apos;effacement :</strong> supprimer vos données (« droit à l&apos;oubli »)</li>
                  <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                  <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
                </ul>
                <p className="text-coffee-700 mt-4">
                  Pour exercer vos droits, contactez-nous à :
                  <a href="mailto:privacy@sipzy.coffee" className="text-coffee-600 hover:text-coffee-800 ml-1">
                    privacy@sipzy.coffee
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">9. Sécurité des données</h2>
                <p className="text-coffee-700 mb-4">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger
                  vos données personnelles contre :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li>L&apos;accès non autorisé</li>
                  <li>La modification, la divulgation ou la destruction non autorisée</li>
                  <li>La perte accidentelle</li>
                </ul>
                <p className="text-coffee-700">
                  Mesures appliquées : cryptage des mots de passe, connexion HTTPS, audits de sécurité réguliers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">10. Cookies</h2>
                <p className="text-coffee-700 mb-4">
                  Nous utilisons des cookies pour :
                </p>
                <ul className="list-disc pl-6 mb-4 text-coffee-700 space-y-2">
                  <li><strong>Cookies essentiels :</strong> maintenir votre session de connexion</li>
                  <li><strong>Cookies analytiques :</strong> comprendre l&apos;utilisation de la plateforme (avec votre consentement)</li>
                </ul>
                <p className="text-coffee-700">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">11. Transferts internationaux</h2>
                <p className="text-coffee-700">
                  Vos données sont hébergées au sein de l&apos;Union Européenne.
                  En cas de transfert hors UE, nous nous assurons que des garanties appropriées sont en place
                  (clauses contractuelles types, Privacy Shield, etc.).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">12. Modifications de la politique</h2>
                <p className="text-coffee-700">
                  Nous pouvons mettre à jour cette politique de confidentialité.
                  Les modifications importantes seront communiquées par email et/ou notification sur la plateforme.
                  Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">13. Réclamation</h2>
                <p className="text-coffee-700">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation
                  auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) :
                </p>
                <div className="bg-cream-50 p-4 rounded-lg text-coffee-700 mt-3">
                  <p><strong>CNIL</strong></p>
                  <p>3 Place de Fontenoy - TSA 80715</p>
                  <p>75334 PARIS CEDEX 07</p>
                  <p>
                    Site web :
                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-coffee-600 hover:text-coffee-800 ml-1">
                      www.cnil.fr
                    </a>
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">14. Contact</h2>
                <p className="text-coffee-700">
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                </p>
                <div className="bg-cream-50 p-4 rounded-lg text-coffee-700 mt-3">
                  <p>Email :
                    <a href="mailto:privacy@sipzy.coffee" className="text-coffee-600 hover:text-coffee-800 ml-1">
                      privacy@sipzy.coffee
                    </a>
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </Container>
      </div>
    </PageLayout>
  );
}
