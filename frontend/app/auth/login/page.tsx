'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Coffee, ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginInput } from '@sipzy/shared/lib/validation/schemas';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie', 'Bienvenue sur Sipzy !');

      // Récupérer la page de redirection depuis les query params ou localStorage
      const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login') || '/';
      localStorage.removeItem('redirect_after_login');

      // Use window.location for reliable redirect after login
      window.location.href = redirectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.';
      toast.error('Erreur de connexion', errorMessage);
    }
  };

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container size="sm">
          {/* Bouton retour */}
          <Link
            href="/"
            className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-coffee-100 rounded-full">
                    <Coffee className="h-8 w-8 text-coffee-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <p className="text-coffee-600 mt-2">
                  Connectez-vous à votre compte Sipzy
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="votre@email.com"
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div className="relative">
                    <Input
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      autoComplete="current-password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-coffee-400 hover:text-coffee-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-coffee-300 text-coffee-600 focus:ring-coffee-500"
                      />
                      <span className="ml-2 text-sm text-coffee-700">
                        Se souvenir de moi
                      </span>
                    </label>

                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-coffee-600">
                    Pas encore de compte ?{' '}
                    <Link
                      href="/auth/register"
                      className="text-coffee-600 hover:text-coffee-800 font-medium transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Connexion rapide pour tests */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-900">
                  🧪 Connexion rapide (Mode test)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-700 mb-3">
                  Utilisez ces comptes de test pour vous connecter rapidement
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('email', 'demo@sipzy.coffee');
                      setValue('password', 'admin123');
                    }}
                    className="text-left px-3 py-2 bg-white rounded border border-blue-200 hover:border-blue-400 transition-colors text-sm"
                  >
                    <div className="font-medium text-coffee-900">Marie Dupont</div>
                    <div className="text-xs text-coffee-600">demo@sipzy.coffee</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('email', 'admin@sipzy.coffee');
                      setValue('password', 'admin123');
                    }}
                    className="text-left px-3 py-2 bg-amber-50 rounded border-2 border-amber-400 hover:border-amber-500 transition-colors text-sm"
                  >
                    <div className="font-medium text-amber-900 flex items-center gap-1">
                      👨‍💼 Admin Sipzy
                      <span className="text-xs px-1.5 py-0.5 bg-amber-200 rounded text-amber-800">ADMIN</span>
                    </div>
                    <div className="text-xs text-amber-700">admin@sipzy.coffee</div>
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  Cliquez sur un compte puis sur &quot;Se connecter&quot;
                </p>
              </CardContent>
            </Card>

            {/* Informations supplémentaires */}
            <div className="mt-8 text-center">
              <p className="text-sm text-coffee-500">
                En vous connectant, vous acceptez nos{' '}
                <Link href="/terms" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                  conditions d&apos;utilisation
                </Link>{' '}
                et notre{' '}
                <Link href="/privacy" className="text-coffee-600 hover:text-coffee-800 transition-colors">
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="bg-cream-50 py-8">
          <Container size="sm">
            <div className="max-w-md mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-coffee-600">Chargement...</div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </div>
      </PageLayout>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
