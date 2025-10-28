'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { favoritesApi } from '@/lib/api/favoritesApi';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  coffeeId: number | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  coffeeId,
  size = 'md',
  showLabel = false,
  onToggle,
}: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Charger l'état initial
  useEffect(() => {
    if (user) {
      const favorite = favoritesApi.isFavorite(user.id, String(coffeeId));
      setIsFavorite(favorite);
    }
  }, [user, coffeeId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Rediriger vers login si non authentifié
    if (!isAuthenticated || !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Basculer l'état favori
    const newIsFavorite = favoritesApi.toggleFavorite(user.id, String(coffeeId));
    setIsFavorite(newIsFavorite);

    // Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Callback
    if (onToggle) {
      onToggle(newIsFavorite);
    }
  };

  // Tailles
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${
          isFavorite
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-gray-100 hover:text-red-600'
        }
        shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
      `}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          isFavorite ? 'fill-current' : ''
        }`}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isFavorite ? 'Favori' : 'Ajouter'}
        </span>
      )}
    </button>
  );
}
