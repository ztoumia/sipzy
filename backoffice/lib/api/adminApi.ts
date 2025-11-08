/**
 * Admin API Client
 * Handles all admin-specific API calls
 */

import { apiClient } from '@sipzy/shared/lib/api/apiClient';
import { Coffee } from '@sipzy/shared/types';

// ============================================================================
// Types
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalCoffees: number;
  totalReviews: number;
  pendingCoffees: number;
  pendingReviews: number;
  reportedContent: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ModerationAction {
  coffeeId: number;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
  adminId: number;
}

export interface ActivityLog {
  id: number;
  message: string;
  timestamp: string;
  type: string;
  userId?: number;
  targetId?: number;
}

// ============================================================================
// Admin API
// ============================================================================

export const adminApi = {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/api/admin/stats');
    return response.data;
  },

  /**
   * Get pending coffees for moderation
   */
  async getPendingCoffees(page: number = 1, size: number = 10): Promise<PaginatedResponse<Coffee>> {
    const response = await apiClient.get<PaginatedResponse<Coffee>>('/api/admin/coffees/pending', {
      params: { page: page - 1, size },
    });
    return response.data;
  },

  /**
   * Get all coffees with filters
   */
  async getCoffees(
    page: number = 1,
    size: number = 10,
    status?: string,
    search?: string
  ): Promise<PaginatedResponse<Coffee>> {
    const response = await apiClient.get<PaginatedResponse<Coffee>>('/api/admin/coffees', {
      params: {
        page: page - 1,
        size,
        status,
        search,
      },
    });
    return response.data;
  },

  /**
   * Get all coffees with filters (alternative signature)
   */
  async getAllCoffees(
    filters: { status?: string; search?: string },
    page: number = 1,
    size: number = 10
  ): Promise<PaginatedResponse<Coffee>> {
    const response = await apiClient.get<PaginatedResponse<Coffee>>('/api/admin/coffees', {
      params: {
        page: page - 1,
        size,
        status: filters.status,
        search: filters.search,
      },
    });
    return response.data;
  },

  /**
   * Approve a coffee
   */
  async approveCoffee(action: ModerationAction): Promise<void> {
    await apiClient.post(`/api/admin/coffees/${action.coffeeId}/approve`, {
      adminNotes: action.adminNotes,
    });
  },

  /**
   * Reject a coffee
   */
  async rejectCoffee(action: ModerationAction): Promise<void> {
    await apiClient.post(`/api/admin/coffees/${action.coffeeId}/reject`, {
      adminNotes: action.adminNotes,
    });
  },

  /**
   * Delete a coffee
   */
  async deleteCoffee(coffeeId: number): Promise<void> {
    await apiClient.delete(`/api/admin/coffees/${coffeeId}`);
  },

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    const response = await apiClient.get<ActivityLog[]>('/api/admin/activity/recent', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get all activity logs with pagination
   */
  async getActivityLogs(
    page: number = 1,
    size: number = 20,
    type?: string
  ): Promise<PaginatedResponse<ActivityLog>> {
    const response = await apiClient.get<PaginatedResponse<ActivityLog>>('/api/admin/activity', {
      params: {
        page: page - 1,
        size,
        type,
      },
    });
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    const response = await apiClient.get('/api/admin/users/stats');
    return response.data;
  },

  /**
   * Get all users with pagination
   */
  async getUsers(
    page: number = 1,
    size: number = 20,
    search?: string,
    role?: string
  ): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/api/admin/users', {
      params: {
        page: page - 1,
        size,
        search,
        role,
      },
    });
    return response.data;
  },

  /**
   * Ban a user
   */
  async banUser(userId: number, reason?: string): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/ban`, { reason });
  },

  /**
   * Unban a user
   */
  async unbanUser(userId: number): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/unban`);
  },

  /**
   * Promote user to admin
   */
  async promoteToAdmin(userId: number): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/promote`);
  },

  /**
   * Demote admin to user
   */
  async demoteFromAdmin(userId: number): Promise<void> {
    await apiClient.post(`/api/admin/users/${userId}/demote`);
  },

  /**
   * Get reports with filters
   */
  async getReports(
    page: number = 1,
    size: number = 20,
    status?: string,
    type?: string
  ): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/api/admin/reports', {
      params: {
        page: page - 1,
        size,
        status,
        type,
      },
    });
    return response.data;
  },

  /**
   * Resolve a report
   */
  async resolveReport(reportId: number, action: string, notes?: string): Promise<void> {
    await apiClient.post(`/api/admin/reports/${reportId}/resolve`, {
      action,
      adminNotes: notes,
    });
  },

  /**
   * Dismiss a report
   */
  async dismissReport(reportId: number, reason?: string): Promise<void> {
    await apiClient.post(`/api/admin/reports/${reportId}/dismiss`, { reason });
  },

  /**
   * Get analytics data
   */
  async getAnalytics(period: string = '7d'): Promise<any> {
    const response = await apiClient.get('/api/admin/analytics', {
      params: { period },
    });
    return response.data;
  },
};

export default adminApi;
