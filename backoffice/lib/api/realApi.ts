/**
 * Admin API Service - Backend endpoints for backoffice
 * Contains only admin-specific and authentication endpoints
 */

import { apiClient, unwrapResponse } from '@sipzy/shared/lib/api/apiClient';
import type {
  ApiResponse,
  AuthResponse,
  User,
  Coffee,
  Report,
  AdminStats,
  LoginForm,
  UserProfileForm,
  PaginatedResponse,
} from '@sipzy/shared/types';

// Local request/response types not in shared
export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ModerateCoffeeRequest {
  adminNotes?: string;
}

export interface BanUserRequest {
  reason?: string;
}

export interface ModerateReportRequest {
  adminNotes?: string;
}

export interface ActivityResponse {
  id: number;
  message: string;
  timestamp: string;
  type: string;
  userId?: number;
  targetId?: number;
}

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  /**
   * Login admin user
   * POST /api/auth/login
   */
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      credentials
    );
    return unwrapResponse(response);
  },

  /**
   * Logout current admin
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * Verify JWT token and check admin role
   * POST /api/auth/verify-token
   */
  async verifyToken(): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/api/auth/verify-token');
    return unwrapResponse(response);
  },
};

// ============================================================================
// Users API (Limited to profile management)
// ============================================================================

export const usersApi = {
  /**
   * Update own profile
   * PUT /api/users/profile
   */
  async updateProfile(data: UserProfileForm): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/api/users/profile', data);
    return unwrapResponse(response);
  },
};

// ============================================================================
// Admin API
// ============================================================================

export const adminApi = {
  // ============================================================================
  // Dashboard & Stats
  // ============================================================================

  /**
   * Get admin dashboard stats
   * GET /api/admin/stats
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/api/admin/stats');
    return unwrapResponse(response);
  },

  /**
   * Get recent activity
   * GET /api/admin/activity
   */
  async getRecentActivity(limit = 10): Promise<ActivityResponse[]> {
    const response = await apiClient.get<ApiResponse<ActivityResponse[]>>('/api/admin/activity', {
      params: { limit },
    });
    return unwrapResponse(response);
  },

  // ============================================================================
  // Coffee Moderation
  // ============================================================================

  /**
   * Get pending coffees
   * GET /api/admin/coffees/pending
   */
  async getPendingCoffees(options?: {
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Coffee>> {
    const response = await apiClient.get<PageResponse<Coffee>>(
      '/api/admin/coffees/pending',
      { params: options }
    );
    return response.data;
  },

  /**
   * Get all coffees (admin view)
   * GET /api/admin/coffees
   */
  async getAllCoffees(options?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Coffee>> {
    const response = await apiClient.get<PageResponse<Coffee>>('/api/admin/coffees', {
      params: options,
    });
    return response.data;
  },

  /**
   * Approve coffee
   * PUT /api/admin/coffees/{id}/approve
   */
  async approveCoffee(id: number, data?: ModerateCoffeeRequest): Promise<Coffee> {
    const response = await apiClient.put<ApiResponse<Coffee>>(
      `/api/admin/coffees/${id}/approve`,
      data || {}
    );
    return unwrapResponse(response);
  },

  /**
   * Reject coffee
   * PUT /api/admin/coffees/{id}/reject
   */
  async rejectCoffee(id: number, data?: ModerateCoffeeRequest): Promise<Coffee> {
    const response = await apiClient.put<ApiResponse<Coffee>>(
      `/api/admin/coffees/${id}/reject`,
      data || {}
    );
    return unwrapResponse(response);
  },

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(options?: {
    page?: number;
    limit?: number;
  }): Promise<PageResponse<User>> {
    const response = await apiClient.get<PageResponse<User>>('/api/admin/users', {
      params: options,
    });
    return response.data;
  },

  /**
   * Ban user
   * PUT /api/admin/users/{id}/ban
   */
  async banUser(id: number, data: BanUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      `/api/admin/users/${id}/ban`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Unban user
   * PUT /api/admin/users/{id}/unban
   */
  async unbanUser(id: number): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      `/api/admin/users/${id}/unban`
    );
    return unwrapResponse(response);
  },

  // ============================================================================
  // Report Moderation
  // ============================================================================

  /**
   * Get pending reports
   * GET /api/admin/reports/pending
   */
  async getPendingReports(options?: {
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Report>> {
    const response = await apiClient.get<PageResponse<Report>>(
      '/api/admin/reports/pending',
      { params: options }
    );
    return response.data;
  },

  /**
   * Get all reports
   * GET /api/admin/reports
   */
  async getAllReports(options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PageResponse<Report>> {
    const response = await apiClient.get<PageResponse<Report>>('/api/admin/reports', {
      params: options,
    });
    return response.data;
  },

  /**
   * Resolve report
   * PUT /api/admin/reports/{id}/resolve
   */
  async resolveReport(id: number, data?: ModerateReportRequest): Promise<Report> {
    const response = await apiClient.put<ApiResponse<Report>>(
      `/api/admin/reports/${id}/resolve`,
      data || {}
    );
    return unwrapResponse(response);
  },

  /**
   * Dismiss report
   * PUT /api/admin/reports/{id}/dismiss
   */
  async dismissReport(id: number, data?: ModerateReportRequest): Promise<Report> {
    const response = await apiClient.put<ApiResponse<Report>>(
      `/api/admin/reports/${id}/dismiss`,
      data || {}
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// Unified API Export
// ============================================================================

const api = {
  auth: authApi,
  users: usersApi,
  admin: adminApi,
};

export default api;
