'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { ShieldAlert, Coffee } from 'lucide-react';

function AdminLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });

      toast.success('Connexion réussie', 'Bienvenue dans le backoffice');

      // Rediriger vers la page demandée ou le dashboard
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        'Échec de la connexion',
        error instanceof Error ? error.message : 'Email ou mot de passe incorrect'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sipzy Admin
            </h1>
            <p className="text-gray-600">
              Accès réservé aux administrateurs
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Accès administrateur requis</p>
              <p className="text-amber-700">
                Vous devez disposer d'un compte administrateur pour accéder au backoffice.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email administrateur
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sipzy.coffee"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <a
                href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Retour au site public
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-400 mt-6">
          © {new Date().getFullYear()} Sipzy Coffee. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    }>
      <AdminLoginPageContent />
    </Suspense>
  );
}
