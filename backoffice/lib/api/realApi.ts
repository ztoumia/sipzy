/**
 * Admin API Service - Backend endpoints for backoffice
 * Contains only admin-specific and authentication endpoints
 */

import apiClient, { unwrapResponse } from './apiClient';
import type {
  ApiResponse,
  PageResponse,
  // Auth
  LoginRequest,
  AuthResponse,
  // Users
  UserResponse,
  UpdateProfileRequest,
  // Coffees
  CoffeeResponse,
  ModerateCoffeeRequest,
  // Admin
  AdminStatsResponse,
  BanUserRequest,
  ReportResponse,
  ModerateReportRequest,
  ActivityResponse,
} from '../types/api';

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  /**
   * Login admin user
   * POST /api/auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
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
  async verifyToken(): Promise<UserResponse> {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/auth/verify-token');
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
  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const response = await apiClient.put<ApiResponse<UserResponse>>('/api/users/profile', data);
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
  async getStats(): Promise<AdminStatsResponse> {
    const response = await apiClient.get<ApiResponse<AdminStatsResponse>>('/api/admin/stats');
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
  }): Promise<PageResponse<CoffeeResponse>> {
    const response = await apiClient.get<PageResponse<CoffeeResponse>>(
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
  }): Promise<PageResponse<CoffeeResponse>> {
    const response = await apiClient.get<PageResponse<CoffeeResponse>>('/api/admin/coffees', {
      params: options,
    });
    return response.data;
  },

  /**
   * Approve coffee
   * PUT /api/admin/coffees/{id}/approve
   */
  async approveCoffee(id: number, data?: ModerateCoffeeRequest): Promise<CoffeeResponse> {
    const response = await apiClient.put<ApiResponse<CoffeeResponse>>(
      `/api/admin/coffees/${id}/approve`,
      data || {}
    );
    return unwrapResponse(response);
  },

  /**
   * Reject coffee
   * PUT /api/admin/coffees/{id}/reject
   */
  async rejectCoffee(id: number, data?: ModerateCoffeeRequest): Promise<CoffeeResponse> {
    const response = await apiClient.put<ApiResponse<CoffeeResponse>>(
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
  }): Promise<PageResponse<UserResponse>> {
    const response = await apiClient.get<PageResponse<UserResponse>>('/api/admin/users', {
      params: options,
    });
    return response.data;
  },

  /**
   * Ban user
   * PUT /api/admin/users/{id}/ban
   */
  async banUser(id: number, data: BanUserRequest): Promise<UserResponse> {
    const response = await apiClient.put<ApiResponse<UserResponse>>(
      `/api/admin/users/${id}/ban`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Unban user
   * PUT /api/admin/users/{id}/unban
   */
  async unbanUser(id: number): Promise<UserResponse> {
    const response = await apiClient.put<ApiResponse<UserResponse>>(
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
  }): Promise<PageResponse<ReportResponse>> {
    const response = await apiClient.get<PageResponse<ReportResponse>>(
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
  }): Promise<PageResponse<ReportResponse>> {
    const response = await apiClient.get<PageResponse<ReportResponse>>('/api/admin/reports', {
      params: options,
    });
    return response.data;
  },

  /**
   * Resolve report
   * PUT /api/admin/reports/{id}/resolve
   */
  async resolveReport(id: number, data?: ModerateReportRequest): Promise<ReportResponse> {
    const response = await apiClient.put<ApiResponse<ReportResponse>>(
      `/api/admin/reports/${id}/resolve`,
      data || {}
    );
    return unwrapResponse(response);
  },

  /**
   * Dismiss report
   * PUT /api/admin/reports/{id}/dismiss
   */
  async dismissReport(id: number, data?: ModerateReportRequest): Promise<ReportResponse> {
    const response = await apiClient.put<ApiResponse<ReportResponse>>(
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
