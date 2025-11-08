import { User, Review, Coffee, UserProfileForm } from '@sipzy/shared/types';
import api from './realApi';

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
  /**
   * Récupère le profil public d'un utilisateur par son username
   */
  async getUserProfile(username: string): Promise<UserProfile | null> {
    try {
      // Use real API
      // Get user by username
      const userResponse = await api.users.getByUsername(username);

      // Get user profile with stats
      const profileData = await api.users.getProfile(userResponse.id);

      // Map backend types to frontend types
      const user: User = {
        id: userResponse.id,
        username: userResponse.username,
        email: userResponse.email,
        role: userResponse.role as 'USER' | 'ADMIN',
        avatarUrl: userResponse.avatarUrl,
        bio: userResponse.bio,
        isActive: userResponse.isActive,
        emailVerified: userResponse.emailVerified,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      };

      const stats: UserProfileStats = {
        totalReviews: profileData.stats.totalReviews,
        totalCoffeesSubmitted: profileData.stats.totalCoffeesSubmitted,
        averageRating: profileData.stats.averageRating,
        helpfulVotes: profileData.stats.totalHelpfulVotes,
      };

      // Map recent reviews
      const recentReviews: Review[] = profileData.recentReviews.map((r: any) => ({
        id: r.id,
        coffeeId: r.coffee.id,
        userId: r.user.id,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.imageUrl,
        helpfulCount: r.helpfulVotes,
        notHelpfulCount: r.notHelpfulVotes || 0,
        isFlagged: r.isFlagged || false,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      // Map approved coffees
      const approvedCoffees: Coffee[] = profileData.approvedCoffees.map((c: any) => ({
        id: c.id,
        name: c.name,
        roasterId: c.roaster.id,
        roasterName: c.roaster.name,
        roasterCountry: c.roaster.location,
        origin: c.origin,
        roastLevel: c.roastLevel,
        price: c.price,
        process: c.process,
        description: c.description,
        imageUrl: c.imageUrl,
        notes: c.notes.map((n: any) => n.name),
        avgRating: c.averageRating,
        reviewCount: c.totalReviews,
        status: c.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        submittedBy: userResponse.id,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return {
        user,
        stats,
        recentReviews,
        approvedCoffees,
      };
    } catch (error) {
      console.error('🔴 [ProfileApi] Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Récupère tous les avis d'un utilisateur
   */
  async getUserReviews(username: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    try {
      // Use real API
      const userResponse = await api.users.getByUsername(username);
      const reviewsPage = await api.users.getReviews(userResponse.id, { page, limit });

      // Map to frontend Review type
      return reviewsPage.data.map((r: any) => ({
        id: r.id,
        coffeeId: r.coffee.id,
        userId: r.user.id,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.imageUrl,
        helpfulCount: r.helpfulVotes,
        notHelpfulCount: r.notHelpfulVotes || 0,
        isFlagged: r.isFlagged || false,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
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
      // Use real API
      const userResponse = await api.users.getByUsername(username);
      const coffeesPage = await api.users.getCoffees(userResponse.id, { page, limit });

      // Map to frontend Coffee type
      return coffeesPage.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        roasterId: c.roaster.id,
        roasterName: c.roaster.name,
        roasterCountry: c.roaster.location,
        origin: c.origin,
        roastLevel: c.roastLevel,
        price: c.price,
        process: c.process,
        description: c.description,
        imageUrl: c.imageUrl,
        notes: c.notes.map((n: any) => n.name),
        avgRating: c.averageRating,
        reviewCount: c.totalReviews,
        status: c.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        submittedBy: userResponse.id,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
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
      // Use real API
      const userResponse = await api.users.updateProfile({
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      });

      // Map to frontend User type
      const updatedUser: User = {
        id: userResponse.id,
        username: userResponse.username,
        email: userResponse.email,
        role: userResponse.role as 'USER' | 'ADMIN',
        avatarUrl: userResponse.avatarUrl,
        bio: userResponse.bio,
        isActive: userResponse.isActive,
        emailVerified: userResponse.emailVerified,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      };

      // Update localStorage
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
      // Use real API
      const prefs = await api.users.getPreferences();
      return prefs;
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
      // Use real API
      await api.users.updatePreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }
}

export const profileApi = new ProfileApi();
