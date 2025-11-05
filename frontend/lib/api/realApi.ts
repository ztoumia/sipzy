/**
 * Real API Service - Wrapper for all backend endpoints
 * Replaces mock API with actual Spring Boot backend calls
 */

import apiClient, { unwrapResponse } from './apiClient';
import type {
  ApiResponse,
  PageResponse,
  // Auth
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  // Users
  UserResponse,
  UserProfileResponse,
  UpdateProfileRequest,
  UserPreferencesResponse,
  // Coffees
  CoffeeResponse,
  CreateCoffeeRequest,
  CoffeeFiltersRequest,
  // Roasters
  RoasterResponse,
  // Notes
  NoteResponse,
  NoteByCategoryResponse,
  // Reviews
  ReviewResponse,
  CreateReviewRequest,
  VoteReviewRequest,
  ReviewVoteResponse,
  // Admin
  AdminStatsResponse,
  ModerateCoffeeRequest,
  BanUserRequest,
  ReportResponse,
  ModerateReportRequest,
  ActivityResponse,
  // Upload
  UploadSignatureResponse,
} from '../types/api';

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  /**
   * Login user
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
   * Register new user
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/register',
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * Verify JWT token
   * POST /api/auth/verify-token
   */
  async verifyToken(): Promise<UserResponse> {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/auth/verify-token');
    return unwrapResponse(response);
  },

  /**
   * Request password reset
   * POST /api/auth/forgot-password?email={email}
   */
  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<string>>(
      `/api/auth/forgot-password`,
      null,
      { params: { email } }
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// Coffees API
// ============================================================================

export const coffeesApi = {
  /**
   * List coffees with filters and pagination
   * GET /api/coffees
   */
  async list(filters?: CoffeeFiltersRequest): Promise<PageResponse<CoffeeResponse>> {
    const response = await apiClient.get<PageResponse<CoffeeResponse>>('/api/coffees', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Alias for list() - search coffees with filters
   */
  async search(filters?: CoffeeFiltersRequest): Promise<PageResponse<CoffeeResponse>> {
    return this.list(filters);
  },

  /**
   * Get coffee by ID
   * GET /api/coffees/{id}
   */
  async getById(id: number): Promise<CoffeeResponse> {
    const response = await apiClient.get<ApiResponse<CoffeeResponse>>(`/api/coffees/${id}`);
    return unwrapResponse(response);
  },

  /**
   * Create new coffee
   * POST /api/coffees
   */
  async create(data: CreateCoffeeRequest): Promise<CoffeeResponse> {
    const response = await apiClient.post<ApiResponse<CoffeeResponse>>('/api/coffees', data);
    return unwrapResponse(response);
  },

  /**
   * Update coffee
   * PUT /api/coffees/{id}
   */
  async update(id: number, data: CreateCoffeeRequest): Promise<CoffeeResponse> {
    const response = await apiClient.put<ApiResponse<CoffeeResponse>>(
      `/api/coffees/${id}`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Delete coffee
   * DELETE /api/coffees/{id}
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/coffees/${id}`);
  },

  /**
   * Get popular coffees
   * GET /api/coffees/popular
   */
  async getPopular(limit = 8): Promise<CoffeeResponse[]> {
    const response = await apiClient.get<ApiResponse<CoffeeResponse[]>>('/api/coffees/popular', {
      params: { limit },
    });
    return unwrapResponse(response);
  },

  /**
   * Get recent coffees
   * GET /api/coffees/recent
   */
  async getRecent(limit = 8): Promise<CoffeeResponse[]> {
    const response = await apiClient.get<ApiResponse<CoffeeResponse[]>>('/api/coffees/recent', {
      params: { limit },
    });
    return unwrapResponse(response);
  },

  /**
   * Get similar coffees
   * GET /api/coffees/{id}/similar
   */
  async getSimilar(id: number, limit = 4): Promise<CoffeeResponse[]> {
    const response = await apiClient.get<ApiResponse<CoffeeResponse[]>>(
      `/api/coffees/${id}/similar`,
      { params: { limit } }
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// Roasters API
// ============================================================================

export const roastersApi = {
  /**
   * List all roasters
   * GET /api/roasters
   */
  async list(): Promise<RoasterResponse[]> {
    const response = await apiClient.get<ApiResponse<RoasterResponse[]>>('/api/roasters');
    return unwrapResponse(response);
  },

  /**
   * Alias for list() - get all roasters
   */
  async getAll(): Promise<RoasterResponse[]> {
    return this.list();
  },

  /**
   * Get roaster by ID
   * GET /api/roasters/{id}
   */
  async getById(id: number): Promise<RoasterResponse> {
    const response = await apiClient.get<ApiResponse<RoasterResponse>>(`/api/roasters/${id}`);
    return unwrapResponse(response);
  },
};

// ============================================================================
// Notes API
// ============================================================================

export const notesApi = {
  /**
   * List all flavor notes
   * GET /api/notes
   */
  async list(): Promise<NoteResponse[]> {
    const response = await apiClient.get<ApiResponse<NoteResponse[]>>('/api/notes');
    return unwrapResponse(response);
  },

  /**
   * Alias for list() - get all notes
   */
  async getAll(): Promise<NoteResponse[]> {
    return this.list();
  },

  /**
   * Get notes grouped by category
   * GET /api/notes/categories
   */
  async getByCategory(): Promise<NoteByCategoryResponse[]> {
    const response = await apiClient.get<ApiResponse<NoteByCategoryResponse[]>>(
      '/api/notes/categories'
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// Reviews API
// ============================================================================

export const reviewsApi = {
  /**
   * Get reviews for a coffee
   * GET /api/coffees/{coffeeId}/reviews
   */
  async getForCoffee(
    coffeeId: number,
    options?: {
      sortBy?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PageResponse<ReviewResponse>> {
    const response = await apiClient.get<PageResponse<ReviewResponse>>(
      `/api/coffees/${coffeeId}/reviews`,
      { params: options }
    );
    return response.data;
  },

  /**
   * Alias for getForCoffee() - get reviews by coffee ID
   */
  async getByCoffeeId(coffeeId: number, page = 1, limit = 10): Promise<PageResponse<ReviewResponse>> {
    return this.getForCoffee(coffeeId, { page, limit });
  },

  /**
   * Create review
   * POST /api/reviews
   */
  async create(data: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>('/api/reviews', data);
    return unwrapResponse(response);
  },

  /**
   * Update review
   * PUT /api/reviews/{id}
   */
  async update(id: number, data: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.put<ApiResponse<ReviewResponse>>(`/api/reviews/${id}`, data);
    return unwrapResponse(response);
  },

  /**
   * Delete review
   * DELETE /api/reviews/{id}
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/reviews/${id}`);
  },

  /**
   * Vote on review (helpful/not helpful)
   * POST /api/reviews/{id}/vote
   */
  async vote(id: number, data: VoteReviewRequest): Promise<ReviewVoteResponse> {
    const response = await apiClient.post<ApiResponse<ReviewVoteResponse>>(
      `/api/reviews/${id}/vote`,
      data
    );
    return unwrapResponse(response);
  },

  /**
   * Get recent reviews (global)
   * GET /api/reviews/recent
   */
  async getRecent(limit = 6): Promise<ReviewResponse[]> {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>('/api/reviews/recent', {
      params: { limit },
    });
    return unwrapResponse(response);
  },
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  /**
   * Get user by ID
   * GET /api/users/{id}
   */
  async getById(id: number): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/api/users/${id}`);
    return unwrapResponse(response);
  },

  /**
   * Get user by username
   * GET /api/users/username/{username}
   */
  async getByUsername(username: string): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/api/users/username/${username}`
    );
    return unwrapResponse(response);
  },

  /**
   * Get user profile with stats
   * GET /api/users/{id}/profile
   */
  async getProfile(id: number): Promise<UserProfileResponse> {
    const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
      `/api/users/${id}/profile`
    );
    return unwrapResponse(response);
  },

  /**
   * Update own profile
   * PUT /api/users/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const response = await apiClient.put<ApiResponse<UserResponse>>('/api/users/profile', data);
    return unwrapResponse(response);
  },

  /**
   * Get user reviews
   * GET /api/users/{id}/reviews
   */
  async getReviews(
    id: number,
    options?: { page?: number; limit?: number }
  ): Promise<PageResponse<ReviewResponse>> {
    const response = await apiClient.get<PageResponse<ReviewResponse>>(
      `/api/users/${id}/reviews`,
      { params: options }
    );
    return response.data;
  },

  /**
   * Get user coffees
   * GET /api/users/{id}/coffees
   */
  async getCoffees(
    id: number,
    options?: { page?: number; limit?: number }
  ): Promise<PageResponse<CoffeeResponse>> {
    const response = await apiClient.get<PageResponse<CoffeeResponse>>(
      `/api/users/${id}/coffees`,
      { params: options }
    );
    return response.data;
  },

  /**
   * Get user preferences
   * GET /api/users/preferences
   */
  async getPreferences(): Promise<UserPreferencesResponse> {
    const response = await apiClient.get<ApiResponse<UserPreferencesResponse>>(
      '/api/users/preferences'
    );
    return unwrapResponse(response);
  },

  /**
   * Update user preferences
   * PUT /api/users/preferences
   */
  async updatePreferences(data: UserPreferencesResponse): Promise<string> {
    const response = await apiClient.put<ApiResponse<string>>('/api/users/preferences', data);
    return unwrapResponse(response);
  },
};

// ============================================================================
// Upload API
// ============================================================================

export const uploadApi = {
  /**
   * Get signature for avatar upload
   * GET /api/upload/signature/avatar
   */
  async getAvatarSignature(): Promise<UploadSignatureResponse> {
    const response = await apiClient.get<ApiResponse<UploadSignatureResponse>>(
      '/api/upload/signature/avatar'
    );
    return unwrapResponse(response);
  },

  /**
   * Get signature for coffee image upload
   * GET /api/upload/signature/coffee-image
   */
  async getCoffeeImageSignature(): Promise<UploadSignatureResponse> {
    const response = await apiClient.get<ApiResponse<UploadSignatureResponse>>(
      '/api/upload/signature/coffee-image'
    );
    return unwrapResponse(response);
  },

  /**
   * Get signature for review image upload
   * GET /api/upload/signature/review-image
   */
  async getReviewImageSignature(): Promise<UploadSignatureResponse> {
    const response = await apiClient.get<ApiResponse<UploadSignatureResponse>>(
      '/api/upload/signature/review-image'
    );
    return unwrapResponse(response);
  },
};

// ============================================================================
// Admin API
// ============================================================================

export const adminApi = {
  /**
   * Get admin dashboard stats
   * GET /api/admin/stats
   */
  async getStats(): Promise<AdminStatsResponse> {
    const response = await apiClient.get<ApiResponse<AdminStatsResponse>>('/api/admin/stats');
    return unwrapResponse(response);
  },

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
};

// ============================================================================
// Unified API Export
// ============================================================================

const api = {
  auth: authApi,
  coffees: coffeesApi,
  roasters: roastersApi,
  notes: notesApi,
  reviews: reviewsApi,
  users: usersApi,
  upload: uploadApi,
  admin: adminApi,
};

export default api;
