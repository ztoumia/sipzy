"use client";

import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { reviewApi } from '@/lib/api/mockApi';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { addReviewSchema, type AddReviewInput } from '@/lib/validation/schemas';

interface AddReviewModalProps {
  coffeeId: number;
  onClose: () => void;
  onCreated?: (reviewId: number) => void;
}

export default function AddReviewModal({ coffeeId, onClose, onCreated }: AddReviewModalProps) {
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser: User | null = currentUserStr ? JSON.parse(currentUserStr) as User : null;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddReviewInput>({
    resolver: zodResolver(addReviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      imageUrl: '',
    },
  });

  // Gestion de la touche Escape pour fermer la modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap - garder le focus dans la modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus sur le premier élément
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Tab + Shift
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab seul
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab as any);
    return () => modal.removeEventListener('keydown', handleTab as any);
  }, []);

  const onSubmit = async (data: AddReviewInput) => {
    if (!currentUser) {
      toast.error('Authentification requise', 'Vous devez être connecté pour ajouter un avis');
      return;
    }

    try {
      const created = await reviewApi.createReview({
        coffeeId,
        userId: currentUser.id,
        rating: data.rating,
        comment: data.comment.trim(),
      });

      toast.success('Avis publié', 'Votre avis a été publié avec succès');
      onCreated?.(created.id);
      onClose();
    } catch {
      toast.error('Erreur', 'Une erreur est survenue lors de la création de l\'avis');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg max-w-xl w-full p-6 mx-4" ref={modalRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="modal-title" className="text-lg font-semibold">Ajouter un avis</h3>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="text-coffee-600 hover:text-coffee-800 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee-900 mb-2">Note</label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value}
                  interactive={true}
                  onRatingChange={field.onChange}
                  size="lg"
                />
              )}
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-coffee-900 mb-2">
              Commentaire
            </label>
            <textarea
              id="comment"
              {...register('comment')}
              className="w-full h-32 rounded-lg border border-coffee-300 px-3 py-2 text-sm placeholder:text-coffee-400 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
              placeholder="Racontez votre expérience..."
              aria-describedby={errors.comment ? 'comment-error' : undefined}
              aria-invalid={errors.comment ? 'true' : 'false'}
            />
            {errors.comment && (
              <p id="comment-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.comment.message}
              </p>
            )}
          </div>

          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value || ''}
                onChange={field.onChange}
                label="Photo (optionnelle)"
              />
            )}
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} type="button">Annuler</Button>
            <Button type="submit" loading={isSubmitting}>Publier l'avis</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
