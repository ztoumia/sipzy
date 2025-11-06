/**
 * API Response Types for Sipzy Backend
 * Aligned with Spring Boot backend responses
 */

// ============================================================================
// Common Response Wrappers
// ============================================================================

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Error response from backend
 */
export interface ErrorResponse {
  success: boolean; // Always false for errors
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

/**
 * Paginated response wrapper
 */
export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Roaster Types
// ============================================================================

/**
 * Full roaster response
 */
export interface RoasterResponse {
  id: number;
  name: string;
  description: string;
  location: string; // Changed from 'country' to 'location' for consistency
  website: string;
  logoUrl: string;
  isVerified: boolean; // NEW field
  createdAt: string;
  updatedAt: string;
}

/**
 * Roaster summary for nested responses
 */
export interface RoasterSummary {
  id: number;
  name: string;
  location: string; // Changed from 'country' to 'location'
  website: string;
  logoUrl: string;
  isVerified: boolean;
}

// ============================================================================
// Note Types
// ============================================================================

/**
 * Flavor note response
 */
export interface NoteResponse {
  id: number;
  name: string;
  category: string;
  createdAt: string;
}

/**
 * Notes grouped by category
 */
export interface NoteByCategoryResponse {
  category: string;
  notes: NoteResponse[];
}

/**
 * Note summary for nested responses
 */
export interface NoteSummary {
  id: number;
  name: string;
  category: string;
}

// ============================================================================
// Coffee Types
// ============================================================================

/**
 * Coffee status enum
 */
export type CoffeeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Full coffee response
 */
export interface CoffeeResponse {
  id: number;
  name: string;
  roasterId: number;
  roaster: RoasterSummary;
  origin: string;
  process?: string;
  variety?: string;
  altitudeMin?: number;
  altitudeMax?: number;
  harvestYear?: number;
  priceRange?: string;
  description?: string;
  imageUrl?: string;
  avgRating: number;
  reviewCount: number;
  status: CoffeeStatus;
  submittedBy: number;
  submittedByUser?: UserResponse;
  approvedBy?: number;
  approvedByUser?: UserResponse;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes: NoteSummary[];
}

/**
 * Coffee creation request
 */
export interface CreateCoffeeRequest {
  name: string;
  roasterId: number;
  origin?: string;
  process?: string;
  variety?: string;
  altitudeMin?: number;
  altitudeMax?: number;
  harvestYear?: number;
  priceRange?: string;
  description?: string;
  imageUrl?: string;
  noteIds: number[];
}

/**
 * Coffee filters for list endpoint
 */
export interface CoffeeFiltersRequest {
  search?: string;
  origin?: string[];
  roasterId?: number[];
  noteIds?: number[];
  priceRange?: string[];
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * User role enum
 */
export type UserRole = 'USER' | 'ADMIN';

/**
 * User response
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalReviews: number;
  totalCoffeesSubmitted: number;
  averageRating: number;
  helpfulVotes: number;
}

/**
 * User profile with stats
 */
export interface UserProfileResponse {
  user: UserResponse;
  stats: UserStats;
  recentReviews: ReviewResponse[];
  approvedCoffees: CoffeeResponse[];
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * User preferences
 */
export interface UserPreferencesResponse {
  emailNotifications: boolean;
  reviewNotifications: boolean;
  coffeeApprovalNotifications: boolean;
}

// ============================================================================
// Review Types
// ============================================================================

/**
 * Coffee summary for review responses
 */
export interface CoffeeSummary {
  id: number;
  name: string;
  imageUrl?: string;
  roaster: {
    id: number;
    name: string;
  };
}

/**
 * Review response
 */
export interface ReviewResponse {
  id: number;
  coffeeId: number;
  coffee: CoffeeSummary;
  userId: number;
  user: UserResponse;
  rating: number;
  comment: string;
  imageUrl?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create review request
 */
export interface CreateReviewRequest {
  coffeeId: number;
  rating: number;
  comment: string;
  imageUrl?: string;
}

/**
 * Vote on review request
 */
export interface VoteReviewRequest {
  isHelpful: boolean;
}

/**
 * Review vote response
 */
export interface ReviewVoteResponse {
  reviewId: number;
  isHelpful: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
}

// ============================================================================
// Auth Types
// ============================================================================

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Auth response (login/register)
 */
export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// ============================================================================
// Admin Types
// ============================================================================

/**
 * Admin dashboard statistics
 */
export interface AdminStatsResponse {
  totalCoffees: number;
  totalUsers: number;
  totalReviews: number;
  pendingCoffees: number;
  pendingReports: number;
  approvedCoffees: number;
  rejectedCoffees: number;
}

/**
 * Moderate coffee request
 */
export interface ModerateCoffeeRequest {
  adminNotes?: string;
}

/**
 * Ban user request
 */
export interface BanUserRequest {
  reason: string;
  isPermanent: boolean;
  durationInDays?: number;
}

/**
 * Report entity type
 */
export type ReportEntityType = 'COFFEE' | 'REVIEW' | 'USER';

/**
 * Report status
 */
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

/**
 * Report response
 */
export interface ReportResponse {
  id: number;
  entityType: ReportEntityType;
  entityId: number;
  reason: string;
  status: ReportStatus;
  reportedById: number;
  reportedByUsername: string;
  reviewedById?: number;
  reviewedByUsername?: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

/**
 * Moderate report request
 */
export interface ModerateReportRequest {
  adminNotes?: string;
}

/**
 * Activity type enum
 */
export type ActivityType =
  | 'COFFEE_SUBMITTED'
  | 'COFFEE_APPROVED'
  | 'COFFEE_REJECTED'
  | 'REPORT_CREATED'
  | 'REPORT_RESOLVED'
  | 'USER_BANNED';

/**
 * Activity response
 */
export interface ActivityResponse {
  id: number;
  type: ActivityType;
  message: string;
  timestamp: string;
  user?: UserResponse;
  coffee?: CoffeeResponse;
}

// ============================================================================
// Upload Types
// ============================================================================

/**
 * Cloudinary upload signature response
 */
export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  COFFEE_GRID_LIMIT: 12,
  ADMIN_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
