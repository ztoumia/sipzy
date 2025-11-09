"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddReviewModal from '@/components/AddReviewModal';
import { Button } from '@sipzy/shared/components/ui/Button';

export default function AddReviewButton({ coffeeId }: { coffeeId: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    // Vérifier si l'utilisateur est connecté
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!authToken) {
      // Sauvegarder l'URL actuelle pour rediriger après login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirect_after_login', window.location.pathname);
      }

      // Rediriger vers la page de login si non connecté
      router.push('/auth/login');
      return;
    }

    // Ouvrir le modal si connecté
    setOpen(true);
  };

  return (
    <>
      <Button onClick={handleClick} className="w-full">
        Ajouter un avis
      </Button>

      {open && (
        <AddReviewModal
          coffeeId={coffeeId}
          onClose={() => setOpen(false)}
          onCreated={() => {
            // Simple refresh pour recharger les avis (prototype)
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      )}
    </>
  );
}
