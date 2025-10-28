'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { profileApi, UserPreferences } from '@/lib/api/profileApi';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/schemas';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const toast = useToast();

  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    reviewNotifications: true,
    coffeeApprovalNotifications: true,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: '',
      bio: '',
      avatarUrl: '',
    },
  });

  const watchedUsername = watch('username', '');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/profile/edit');
      return;
    }

    // Charger les données du profil
    setValue('username', user.username);
    setValue('bio', user.bio || '');
    setValue('avatarUrl', user.avatarUrl || '');

    setAvatarPreview(user.avatarUrl || '');

    // Charger les préférences
    const loadPreferences = async () => {
      setIsLoading(true);
      const prefs = await profileApi.getPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, [user, router, setValue]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Format invalide', 'Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', 'L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setValue('avatarUrl', '');
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      let avatarUrl = data.avatarUrl;

      // Upload avatar si un fichier est sélectionné
      if (avatarFile) {
        const uploadedUrl = await profileApi.uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          throw new Error('Échec du téléchargement de l\'avatar');
        }
      }

      // Mettre à jour le profil
      const updatedUser = await profileApi.updateProfile({
        ...data,
        avatarUrl,
      });

      if (!updatedUser) {
        throw new Error('Échec de la mise à jour du profil');
      }

      // Mettre à jour les préférences
      const prefsUpdated = await profileApi.updatePreferences(preferences);
      if (!prefsUpdated) {
        console.warn('Échec de la mise à jour des préférences');
      }

      // Mettre à jour le contexte d'authentification
      await updateAuthProfile(updatedUser);

      toast.success('Profil mis à jour', 'Vos modifications ont été enregistrées avec succès');

      // Rediriger vers le profil après 2 secondes
      setTimeout(() => {
        router.push(`/profile/${updatedUser.username}`);
      }, 2000);
    } catch (err) {
      toast.error('Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Container className="py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout>
      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Éditer mon profil</h1>
            <p className="text-gray-600">Modifiez vos informations personnelles et préférences</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo de profil</h2>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-coffee-100">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-600 text-3xl font-bold">
                        {watchedUsername.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      Changer la photo
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG ou WebP. Max 5 MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="votre_pseudo"
                    error={errors.username?.message}
                    {...register('username')}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <textarea
                    id="bio"
                    {...register('bio')}
                    placeholder="Parlez-nous un peu de vous et de votre passion pour le café..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent resize-none"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {watch('bio')?.length || 0} / 500 caractères
                  </p>
                </div>
              </div>
            </div>

            {/* Préférences de notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notifications</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, emailNotifications: e.target.checked })
                    }
                    className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                  />
                  <span className="text-sm text-gray-700">Recevoir les notifications par email</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.reviewNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, reviewNotifications: e.target.checked })
                    }
                    className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                  />
                  <span className="text-sm text-gray-700">
                    Être notifié des nouveaux avis sur mes cafés
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.coffeeApprovalNotifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        coffeeApprovalNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                  />
                  <span className="text-sm text-gray-700">
                    Être notifié de l'approbation de mes soumissions de cafés
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/profile/${user.username}`)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </PageLayout>
  );
}
