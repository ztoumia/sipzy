import { apiClient } from './apiClient';
import { Coffee, Report, User } from '@/types';

// Types for admin API
export interface AdminStats {
  totalCoffees: number;
  totalUsers: number;
  totalReviews: number;
  pendingCoffees: number;
  pendingReports: number;
  approvedCoffees: number;
  rejectedCoffees: number;
}

export interface CoffeeModerationAction {
  coffeeId: number;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
  adminId: number;
}

export interface ReportAction {
  reportId: number;
  action: 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  adminId: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityResponse {
  id: number;
  type: 'coffee_submitted' | 'coffee_approved' | 'coffee_rejected' | 'report_created';
  message: string;
  timestamp: string;
  user?: User;
  coffee?: Coffee;
}

// Admin API
export const adminApi = {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/api/admin/stats');
    return response.data.data;
  },

  /**
   * Get pending coffees for moderation
   */
  async getPendingCoffees(page = 1, limit = 10): Promise<PageResponse<Coffee>> {
    const response = await apiClient.get('/api/admin/coffees/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Approve a coffee
   */
  async approveCoffee(action: CoffeeModerationAction): Promise<Coffee> {
    const response = await apiClient.put(
      `/api/admin/coffees/${action.coffeeId}/approve`,
      { adminNotes: action.adminNotes }
    );
    return response.data.data;
  },

  /**
   * Reject a coffee
   */
  async rejectCoffee(action: CoffeeModerationAction): Promise<Coffee> {
    const response = await apiClient.put(
      `/api/admin/coffees/${action.coffeeId}/reject`,
      { adminNotes: action.adminNotes }
    );
    return response.data.data;
  },

  /**
   * Get all coffees with filters
   */
  async getAllCoffees(
    filters?: {
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      search?: string;
    },
    page = 1,
    limit = 20
  ): Promise<PageResponse<Coffee>> {
    const response = await apiClient.get('/api/admin/coffees', {
      params: {
        status: filters?.status,
        search: filters?.search,
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get all users
   */
  async getAllUsers(page = 1, limit = 20): Promise<PageResponse<User>> {
    const response = await apiClient.get('/api/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Ban a user
   */
  async banUser(userId: number, reason?: string): Promise<User> {
    const response = await apiClient.put(`/api/admin/users/${userId}/ban`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * Unban a user
   */
  async unbanUser(userId: number): Promise<User> {
    const response = await apiClient.put(`/api/admin/users/${userId}/unban`);
    return response.data.data;
  },

  /**
   * Get pending reports
   */
  async getPendingReports(page = 1, limit = 10): Promise<PageResponse<Report>> {
    const response = await apiClient.get('/api/admin/reports/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get all reports with filters
   */
  async getReports(
    filters?: {
      status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    },
    page = 1,
    limit = 20
  ): Promise<PageResponse<Report>> {
    const response = await apiClient.get('/api/admin/reports', {
      params: {
        status: filters?.status,
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Resolve a report (action was taken)
   */
  async resolveReport(reportId: number, adminNotes?: string): Promise<Report> {
    const response = await apiClient.put(`/api/admin/reports/${reportId}/resolve`, {
      adminNotes,
    });
    return response.data.data;
  },

  /**
   * Dismiss a report (no action needed)
   */
  async dismissReport(reportId: number, adminNotes?: string): Promise<Report> {
    const response = await apiClient.put(`/api/admin/reports/${reportId}/dismiss`, {
      adminNotes,
    });
    return response.data.data;
  },

  /**
   * Handle report (generic method for backward compatibility)
   */
  async handleReport(action: ReportAction): Promise<Report> {
    if (action.action === 'RESOLVED') {
      return this.resolveReport(action.reportId, action.adminNotes);
    } else {
      return this.dismissReport(action.reportId, action.adminNotes);
    }
  },

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(limit = 10): Promise<ActivityResponse[]> {
    const response = await apiClient.get('/api/admin/activity', {
      params: { limit },
    });
    return response.data.data;
  },
};
