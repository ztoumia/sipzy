/**
 * API pour la gestion des favoris
 * Utilise le backend real API pour gérer les favoris
 */

import { apiClient, unwrapResponse } from '@sipzy/shared/lib/api/apiClient';
import type { ApiResponse, Coffee } from '@sipzy/shared/types';
import type { PageResponse } from './adminApi';

/**
 * Ajouter un café aux favoris
 * POST /api/users/favorites/{coffeeId}
 */
export const addFavorite = async (coffeeId: number): Promise<void> => {
  await apiClient.post(`/api/users/favorites/${coffeeId}`);
};

/**
 * Retirer un café des favoris
 * DELETE /api/users/favorites/{coffeeId}
 */
export const removeFavorite = async (coffeeId: number): Promise<void> => {
  await apiClient.delete(`/api/users/favorites/${coffeeId}`);
};

/**
 * Basculer l'état favori d'un café (ajouter si absent, retirer si présent)
 * POST /api/users/favorites/{coffeeId}/toggle
 */
export const toggleFavorite = async (coffeeId: number): Promise<boolean> => {
  const response = await apiClient.post<ApiResponse<{ isFavorite: boolean }>>(
    `/api/users/favorites/${coffeeId}/toggle`
  );
  const data = unwrapResponse(response);
  return data.isFavorite;
};

/**
 * Vérifier si un café est dans les favoris
 * GET /api/users/favorites/{coffeeId}/check
 */
export const isFavorite = async (coffeeId: number): Promise<boolean> => {
  const response = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(
    `/api/users/favorites/${coffeeId}/check`
  );
  const data = unwrapResponse(response);
  return data.isFavorite;
};

/**
 * Récupérer tous les cafés favoris avec pagination
 * GET /api/users/favorites?page=1&limit=12
 */
export const getFavorites = async (page = 1, limit = 12): Promise<PageResponse<Coffee>> => {
  const response = await apiClient.get<PageResponse<Coffee>>('/api/users/favorites', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Récupérer les IDs de tous les cafés favoris
 * GET /api/users/favorites/ids
 */
export const getFavoriteIds = async (): Promise<number[]> => {
  const response = await apiClient.get<ApiResponse<number[]>>('/api/users/favorites/ids');
  return unwrapResponse(response);
};

/**
 * Obtenir le nombre de favoris
 * GET /api/users/favorites/count
 */
export const getFavoritesCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ count: number }>>('/api/users/favorites/count');
  const data = unwrapResponse(response);
  return data.count;
};

export const favoritesApi = {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  isFavorite,
  getFavorites,
  getFavoriteIds,
  getFavoritesCount,
};
