'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Coffee, CheckCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@sipzy/shared/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@sipzy/shared/lib/validation/schemas';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      // Simuler l'envoi d'email (en production, ce serait un appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Toujours afficher le succès pour ne pas révéler si l'email existe ou non (sécurité)
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Email envoyé', 'Vérifiez votre boîte de réception');
    } catch {
      toast.error('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (isSubmitted) {
    return (
      <PageLayout>
        <div className="bg-cream-50 py-16">
          <Container size="sm">
            <div className="max-w-md mx-auto">
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-coffee-900 mb-4">
                    Email envoyé !
                  </h2>
                  <p className="text-coffee-600 mb-6">
                    Si un compte existe avec l&apos;adresse <strong>{submittedEmail}</strong>,
                    vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                  </p>
                  <p className="text-sm text-coffee-500 mb-6">
                    Vérifiez également votre dossier spam si vous ne recevez pas l&apos;email dans les prochaines minutes.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/auth/login">
                      <Button variant="outline">Retour à la connexion</Button>
                    </Link>
                    <Link href="/">
                      <Button>Accueil</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container size="sm">
          {/* Bouton retour */}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-coffee-100 rounded-full">
                    <Coffee className="h-8 w-8 text-coffee-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
                <p className="text-coffee-600 mt-2">
                  Pas de problème ! Entrez votre email et nous vous enverrons
                  un lien pour réinitialiser votre mot de passe.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      label="Adresse email"
                      type="email"
                      placeholder="votre@email.com"
                      autoComplete="email"
                      autoFocus
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-coffee-600">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link
                      href="/auth/login"
                      className="text-coffee-600 hover:text-coffee-800 font-medium transition-colors"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informations supplémentaires */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Note de sécurité :</strong>
                </p>
                <p className="text-xs text-blue-700">
                  Pour des raisons de sécurité, nous n&apos;indiquons pas si une adresse email
                  est enregistrée dans notre système. Si vous ne recevez pas d&apos;email,
                  vérifiez que vous avez utilisé la bonne adresse lors de votre inscription.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}
