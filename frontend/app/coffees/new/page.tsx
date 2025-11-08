'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coffee, ArrowLeft, Plus } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import api from '@/lib/api/realApi';
import { Roaster, Note } from '@sipzy/shared/types';
import { useToast } from '@/hooks/useToast';
import { addCoffeeSchema, type AddCoffeeInput } from '@sipzy/shared/lib/validation/schemas';

export default function NewCoffeePage() {
  const router = useRouter();
  const toast = useToast();
  const [success, setSuccess] = useState(false);
  const [roasters, setRoasters] = useState<Roaster[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddCoffeeInput>({
    resolver: zodResolver(addCoffeeSchema) as any,
    defaultValues: {
      name: '',
      roasterId: '' as any,
      origin: '',
      process: '',
      variety: '',
      altitudeMin: undefined,
      altitudeMax: undefined,
      harvestYear: new Date().getFullYear() as any,
      priceRange: '€€',
      description: '',
      imageUrl: '',
      noteIds: [],
    },
  });

  const noteIds = watch('noteIds', []);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      const [roastersData, notesData] = await Promise.all([
        api.roasters.getAll(),
        api.notes.getAll(),
      ]);
      setRoasters(roastersData);
      setNotes(notesData);
    };
    loadData();
  }, []);

  // Vérifier l'authentification
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      localStorage.setItem('redirect_after_login', '/coffees/new');
      router.push('/auth/login');
    }
  }, [router]);

  const toggleNote = (noteId: number) => {
    const currentNotes = watch('noteIds');
    const newNotes = currentNotes.includes(noteId)
      ? currentNotes.filter(id => id !== noteId)
      : [...currentNotes, noteId];
    setValue('noteIds', newNotes);
  };

  const onSubmit = async (data: AddCoffeeInput) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        toast.error('Authentification requise', 'Vous devez être connecté pour proposer un café');
        return;
      }

      let user;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        toast.error('Session invalide', 'Veuillez vous reconnecter');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        router.push('/auth/login');
        return;
      }

      // Simuler l'envoi (à remplacer par l'API réelle)
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Nouveau café soumis:', {
        ...data,
        submittedBy: user.id,
        status: 'PENDING',
      });

      toast.success('Café soumis avec succès', 'Votre proposition est en attente de modération');
      setSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/profile/submissions');
      }, 2000);

    } catch (err) {
      toast.error('Erreur', 'Une erreur est survenue lors de la soumission');
    }
  };

  if (success) {
    return (
      <PageLayout>
        <div className="bg-cream-50 py-16">
          <Container size="sm">
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-coffee-900 mb-4">
                  Café soumis avec succès !
                </h2>
                <p className="text-coffee-600 mb-6">
                  Votre proposition est en attente de modération. Vous serez notifié une fois qu&apos;elle sera approuvée.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/coffees">
                    <Button variant="outline">Voir les cafés</Button>
                  </Link>
                  <Link href="/profile/submissions">
                    <Button>Mes propositions</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Container>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container size="md">
          {/* Breadcrumb */}
          <Link
            href="/coffees"
            className="inline-flex items-center text-coffee-600 hover:text-coffee-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cafés
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coffee-100 rounded-lg">
                  <Coffee className="h-6 w-6 text-coffee-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Proposer un nouveau café</CardTitle>
                  <p className="text-coffee-600 mt-1">
                    Partagez votre découverte avec la communauté
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-coffee-900">Informations de base</h3>

                  <div>
                    <Input
                      label="Nom du café *"
                      placeholder="Ex: Ethiopia Guji Hambela"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Torréfacteur *
                    </label>
                    <select
                      {...register('roasterId')}
                      className="w-full rounded-lg border border-coffee-300 px-3 py-2 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="">Sélectionnez un torréfacteur</option>
                      {roasters.map(roaster => (
                        <option key={roaster.id} value={roaster.id}>
                          {roaster.name} - {roaster.country}
                        </option>
                      ))}
                    </select>
                    {errors.roasterId && (
                      <p className="mt-1 text-sm text-red-600">{errors.roasterId.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Origine *"
                      placeholder="Ex: Ethiopia, Colombia, Kenya"
                      error={errors.origin?.message}
                      {...register('origin')}
                    />
                  </div>

                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value || ''}
                        onChange={field.onChange}
                        label="Photo du café"
                      />
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Processus"
                      placeholder="Natural, Washed, Honey..."
                      error={errors.process?.message}
                      {...register('process')}
                    />

                    <Input
                      label="Variété"
                      placeholder="Heirloom, Bourbon, Gesha..."
                      error={errors.variety?.message}
                      {...register('variety')}
                    />
                  </div>
                </div>

                {/* Détails */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-coffee-900">Détails</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Altitude Min (m)"
                      type="number"
                      placeholder="1800"
                      error={errors.altitudeMin?.message}
                      {...register('altitudeMin')}
                    />

                    <Input
                      label="Altitude Max (m)"
                      type="number"
                      placeholder="2200"
                      error={errors.altitudeMax?.message}
                      {...register('altitudeMax')}
                    />

                    <Input
                      label="Année de récolte"
                      type="number"
                      placeholder={new Date().getFullYear().toString()}
                      error={errors.harvestYear?.message}
                      {...register('harvestYear')}
                    />
                  </div>

                  <Controller
                    name="priceRange"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-coffee-900 mb-2">
                          Gamme de prix
                        </label>
                        <div className="flex gap-2">
                          {(['€', '€€', '€€€', '€€€€'] as const).map(price => (
                            <button
                              key={price}
                              type="button"
                              onClick={() => field.onChange(price)}
                              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                field.value === price
                                  ? 'border-coffee-600 bg-coffee-50 text-coffee-900'
                                  : 'border-coffee-200 text-coffee-600 hover:border-coffee-400'
                              }`}
                            >
                              {price}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full rounded-lg border border-coffee-300 px-3 py-2 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Décrivez les caractéristiques de ce café, son profil gustatif..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Notes aromatiques */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-coffee-900">
                    Notes aromatiques ({noteIds.length} sélectionnées)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {notes.map(note => {
                      const isSelected = noteIds.includes(note.id);
                      return (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => toggleNote(note.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-coffee-600 text-white'
                              : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                          }`}
                        >
                          {isSelected && <Plus className="h-3 w-3" />}
                          {note.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.noteIds && (
                    <p className="text-sm text-red-600">{errors.noteIds.message}</p>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Soumettre le café'}
                  </Button>
                </div>

                <p className="text-sm text-coffee-500 text-center">
                  * Champs obligatoires. Votre proposition sera examinée par nos modérateurs avant publication.
                </p>
              </form>
            </CardContent>
          </Card>
        </Container>
      </div>
    </PageLayout>
  );
}
