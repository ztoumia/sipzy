/**
 * API pour la gestion des favoris
 */

import { Coffee } from '@/types';
import { coffeeApi } from '@/lib/api/mockApi';

const FAVORITES_STORAGE_KEY = 'sipzy_favorites';

// Interface pour les favoris
export interface UserFavorites {
  userId: string;
  coffeeIds: string[];
}

// Récupérer les favoris de tous les utilisateurs
const getAllFavorites = (): UserFavorites[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Sauvegarder tous les favoris
const saveAllFavorites = (favorites: UserFavorites[]): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

// Récupérer les favoris d'un utilisateur
const getUserFavoritesData = (userId: string): UserFavorites => {
  const allFavorites = getAllFavorites();
  const userFavorites = allFavorites.find(f => f.userId === userId);

  return userFavorites || { userId, coffeeIds: [] };
};

/**
 * Récupérer les IDs des cafés favoris d'un utilisateur
 */
export const getFavoriteIds = (userId: string): string[] => {
  const userFavorites = getUserFavoritesData(userId);
  return userFavorites.coffeeIds;
};

/**
 * Récupérer les cafés favoris complets d'un utilisateur
 */
export const getFavorites = async (userId: string): Promise<Coffee[]> => {
  const favoriteIds = getFavoriteIds(userId);

  if (favoriteIds.length === 0) {
    return [];
  }

  // Récupérer tous les cafés et filtrer par IDs favoris
  const coffeesResponse = await coffeeApi.getCoffees({}, 1, 1000);
  const favoriteCoffees = coffeesResponse.data.filter((coffee: Coffee) =>
    favoriteIds.includes(coffee.id)
  );

  return favoriteCoffees;
};

/**
 * Vérifier si un café est dans les favoris d'un utilisateur
 */
export const isFavorite = (userId: string, coffeeId: string): boolean => {
  const favoriteIds = getFavoriteIds(userId);
  return favoriteIds.includes(coffeeId);
};

/**
 * Ajouter un café aux favoris
 */
export const addFavorite = (userId: string, coffeeId: string): boolean => {
  const allFavorites = getAllFavorites();
  const userIndex = allFavorites.findIndex(f => f.userId === userId);

  if (userIndex >= 0) {
    // L'utilisateur a déjà des favoris
    if (!allFavorites[userIndex].coffeeIds.includes(coffeeId)) {
      allFavorites[userIndex].coffeeIds.push(coffeeId);
      saveAllFavorites(allFavorites);
      return true;
    }
    return false; // Déjà dans les favoris
  } else {
    // Créer une nouvelle entrée pour l'utilisateur
    allFavorites.push({
      userId,
      coffeeIds: [coffeeId],
    });
    saveAllFavorites(allFavorites);
    return true;
  }
};

/**
 * Retirer un café des favoris
 */
export const removeFavorite = (userId: string, coffeeId: string): boolean => {
  const allFavorites = getAllFavorites();
  const userIndex = allFavorites.findIndex(f => f.userId === userId);

  if (userIndex >= 0) {
    const coffeeIndex = allFavorites[userIndex].coffeeIds.indexOf(coffeeId);

    if (coffeeIndex >= 0) {
      allFavorites[userIndex].coffeeIds.splice(coffeeIndex, 1);
      saveAllFavorites(allFavorites);
      return true;
    }
  }

  return false; // Pas dans les favoris
};

/**
 * Basculer l'état favori d'un café (ajouter si absent, retirer si présent)
 */
export const toggleFavorite = (userId: string, coffeeId: string): boolean => {
  if (isFavorite(userId, coffeeId)) {
    removeFavorite(userId, coffeeId);
    return false; // Retiré des favoris
  } else {
    addFavorite(userId, coffeeId);
    return true; // Ajouté aux favoris
  }
};

/**
 * Obtenir le nombre de favoris d'un utilisateur
 */
export const getFavoritesCount = (userId: string): number => {
  const favoriteIds = getFavoriteIds(userId);
  return favoriteIds.length;
};

export const favoritesApi = {
  getFavoriteIds,
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getFavoritesCount,
};
