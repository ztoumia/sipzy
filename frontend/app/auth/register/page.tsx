'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Coffee, ArrowLeft, Check, X } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // Validation du mot de passe
  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success('Compte créé avec succès', 'Bienvenue sur Sipzy !');

      // Récupérer la page de redirection depuis les query params ou localStorage
      const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login') || '/';
      localStorage.removeItem('redirect_after_login');
      router.push(redirectUrl);
    } catch (err) {
      toast.error(
        'Erreur lors de la création du compte',
        err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const PasswordRequirement = ({ 
    isValid, 
    children 
  }: { 
    isValid: boolean; 
    children: React.ReactNode; 
  }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600' : 'text-coffee-500'}`}>
      {isValid ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span>{children}</span>
    </div>
  );

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
            Retour à l'accueil
          </Link>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-coffee-100 rounded-full">
                    <Coffee className="h-8 w-8 text-coffee-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Créer un compte</CardTitle>
                <p className="text-coffee-600 mt-2">
                  Rejoignez la communauté Sipzy
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      label="Nom d'utilisateur"
                      type="text"
                      placeholder="votre_nom_utilisateur"
                      autoComplete="username"
                      helperText="3-50 caractères, lettres, chiffres, tirets et underscores uniquement"
                      error={errors.username?.message}
                      {...register('username')}
                    />
                  </div>

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
                      autoComplete="new-password"
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

                  {/* Indicateur de force du mot de passe */}
                  {password && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-coffee-900">
                        Critères du mot de passe :
                      </div>
                      <div className="space-y-1">
                        <PasswordRequirement isValid={passwordValidation.length}>
                          Au moins 8 caractères
                        </PasswordRequirement>
                        <PasswordRequirement isValid={passwordValidation.uppercase}>
                          Une majuscule
                        </PasswordRequirement>
                        <PasswordRequirement isValid={passwordValidation.lowercase}>
                          Une minuscule
                        </PasswordRequirement>
                        <PasswordRequirement isValid={passwordValidation.number}>
                          Un chiffre
                        </PasswordRequirement>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      label="Confirmer le mot de passe"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmez votre mot de passe"
                      autoComplete="new-password"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-coffee-400 hover:text-coffee-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Indicateur de correspondance des mots de passe */}
                  {confirmPassword && (
                    <div className={`flex items-center space-x-2 text-sm ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {doPasswordsMatch ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span>
                        {doPasswordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
                  </Button>

                  <div className="flex items-start space-x-2 -mt-2">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-coffee-300 text-coffee-600 focus:ring-coffee-500"
                      required
                    />
                    <label className="text-sm text-coffee-700">
                      J'accepte les{' '}
                      <Link
                        href="/terms"
                        className="text-coffee-600 hover:text-coffee-800 transition-colors"
                        target="_blank"
                      >
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link
                        href="/privacy"
                        className="text-coffee-600 hover:text-coffee-800 transition-colors"
                        target="_blank"
                      >
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-coffee-600">
                    Déjà un compte ?{' '}
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
            <div className="mt-8 text-center">
              <p className="text-sm text-coffee-500">
                En créant un compte, vous rejoignez une communauté de passionnés de café 
                et pouvez partager vos découvertes avec d'autres amateurs.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}
