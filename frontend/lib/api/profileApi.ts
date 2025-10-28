import { User, Review, Coffee, UserProfileForm } from '@/types';
import { userApi, reviewApi, coffeeApi } from '@/lib/api/mockApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Interface pour les statistiques du profil utilisateur
 */
export interface UserProfileStats {
  totalReviews: number;
  totalCoffeesSubmitted: number;
  averageRating: number;
  helpfulVotes: number;
}

/**
 * Interface pour le profil complet d'un utilisateur
 */
export interface UserProfile {
  user: User;
  stats: UserProfileStats;
  recentReviews: Review[];
  approvedCoffees: Coffee[];
}

/**
 * Interface pour les préférences utilisateur
 */
export interface UserPreferences {
  emailNotifications: boolean;
  reviewNotifications: boolean;
  coffeeApprovalNotifications: boolean;
}

class ProfileApi {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Récupère le profil public d'un utilisateur par son username
   */
  async getUserProfile(username: string): Promise<UserProfile | null> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(`${API_URL}/api/users/${username}/profile`, {
      //   headers: this.getHeaders(),
      // });
      // if (!response.ok) throw new Error('Failed to fetch user profile');
      // return await response.json();

      // Mock data pour développement
      const user = await userApi.getUserByUsername(username);
      if (!user) return null;

      // Récupérer les avis de l'utilisateur
      const reviewsResponse = await userApi.getUserReviews(user.id, 1, 1000);
      const userReviews = reviewsResponse.data;

      // Récupérer tous les cafés et filtrer ceux soumis par l'utilisateur
      const coffeesResponse = await coffeeApi.getCoffees({}, 1, 1000);
      const userCoffees = coffeesResponse.data.filter(
        (c: Coffee) => c.submittedBy === user.id && c.status === 'APPROVED'
      );

      const stats: UserProfileStats = {
        totalReviews: userReviews.length,
        totalCoffeesSubmitted: userCoffees.length,
        averageRating: userReviews.length > 0
          ? userReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / userReviews.length
          : 0,
        helpfulVotes: userReviews.reduce((sum: number, r: Review) => sum + r.helpfulCount, 0),
      };

      return {
        user,
        stats,
        recentReviews: userReviews.slice(0, 10),
        approvedCoffees: userCoffees.slice(0, 10),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Récupère tous les avis d'un utilisateur
   */
  async getUserReviews(username: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(
      //   `${API_URL}/api/users/${username}/reviews?page=${page}&limit=${limit}`,
      //   { headers: this.getHeaders() }
      // );
      // if (!response.ok) throw new Error('Failed to fetch user reviews');
      // return await response.json();

      // Mock data pour développement
      const user = await userApi.getUserByUsername(username);
      if (!user) return [];

      const reviewsResponse = await userApi.getUserReviews(user.id, page, limit);
      return reviewsResponse.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  /**
   * Récupère tous les cafés soumis par un utilisateur
   */
  async getUserCoffees(username: string, page: number = 1, limit: number = 10): Promise<Coffee[]> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(
      //   `${API_URL}/api/users/${username}/coffees?page=${page}&limit=${limit}`,
      //   { headers: this.getHeaders() }
      // );
      // if (!response.ok) throw new Error('Failed to fetch user coffees');
      // return await response.json();

      // Mock data pour développement
      const user = await userApi.getUserByUsername(username);
      if (!user) return [];

      const coffeesResponse = await coffeeApi.getCoffees({}, 1, 1000);
      const userCoffees = coffeesResponse.data.filter(
        (c: Coffee) => c.submittedBy === user.id && c.status === 'APPROVED'
      );

      // Pagination manuelle
      const start = (page - 1) * limit;
      const end = start + limit;
      return userCoffees.slice(start, end);
    } catch (error) {
      console.error('Error fetching user coffees:', error);
      return [];
    }
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  async updateProfile(data: UserProfileForm): Promise<User | null> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(`${API_URL}/api/users/profile`, {
      //   method: 'PUT',
      //   headers: this.getHeaders(),
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      // const updatedUser = await response.json();

      // Mock: Simuler la mise à jour
      const token = this.getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User not found');

      const currentUser = JSON.parse(userStr);
      const updatedUser = {
        ...currentUser,
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date().toISOString(),
      };

      // Mettre à jour le localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Upload un avatar pour l'utilisateur connecté
   */
  async uploadAvatar(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // TODO: Remplacer par appel API réel
      // const response = await fetch(`${API_URL}/api/users/avatar`, {
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${this.getAuthToken()}`,
      //   },
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Failed to upload avatar');
      // const { url } = await response.json();
      // return url;

      // Mock: Utiliser l'API upload existante
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('Failed to upload avatar');
      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  /**
   * Récupère les préférences de l'utilisateur connecté
   */
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(`${API_URL}/api/users/preferences`, {
      //   headers: this.getHeaders(),
      // });
      // if (!response.ok) throw new Error('Failed to fetch preferences');
      // return await response.json();

      // Mock: Récupérer depuis localStorage
      const prefsStr = localStorage.getItem('user_preferences');
      if (!prefsStr) {
        // Préférences par défaut
        return {
          emailNotifications: true,
          reviewNotifications: true,
          coffeeApprovalNotifications: true,
        };
      }

      return JSON.parse(prefsStr);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  /**
   * Met à jour les préférences de l'utilisateur connecté
   */
  async updatePreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      // TODO: Remplacer par appel API réel
      // const response = await fetch(`${API_URL}/api/users/preferences`, {
      //   method: 'PUT',
      //   headers: this.getHeaders(),
      //   body: JSON.stringify(preferences),
      // });
      // if (!response.ok) throw new Error('Failed to update preferences');
      // return true;

      // Mock: Sauvegarder dans localStorage
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }
}

export const profileApi = new ProfileApi();
