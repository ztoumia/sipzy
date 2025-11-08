// Types principaux pour l'application Sipzy

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Roaster {
  id: number;
  name: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
}

export interface Coffee {
  id: number;
  name: string;
  roasterId?: number;
  roaster?: Roaster;
  origin?: string;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy?: number;
  submittedByUser?: User;
  approvedBy?: number;
  approvedByUser?: User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  reviews?: Review[];
}

export interface Review {
  id: number;
  coffeeId: number;
  coffee?: Coffee;
  userId: number;
  user?: User;
  rating: number;
  comment: string;
  imageUrl?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewVote {
  reviewId: number;
  userId: number;
  isHelpful: boolean;
  createdAt: string;
}

export interface Report {
  id: number;
  reportedBy: number;
  reportedByUser?: User;
  entityType: 'REVIEW' | 'COFFEE' | 'USER';
  entityId: number;
  reason: 'SPAM' | 'OFFENSIVE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: number;
  resolvedByUser?: User;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CoffeeForm {
  name: string;
  roasterId?: number;
  roasterName?: string;
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

export interface ReviewForm {
  rating: number;
  comment: string;
  imageUrl?: string;
}

export interface UserProfileForm {
  username: string;
  bio?: string;
  avatarUrl?: string;
}

// Types pour les filtres et recherche
export interface CoffeeFilters {
  search?: string;
  origin?: string[];
  roasterId?: number[];
  noteIds?: number[];
  priceRange?: string[];
  minRating?: number;
  sortBy?: 'name' | 'rating' | 'reviews' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
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

// Types pour l'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Types pour les statistiques admin
export interface AdminStats {
  totalCoffees: number;
  totalUsers: number;
  totalReviews: number;
  pendingCoffees: number;
  pendingReports: number;
  reviewsToday: number;
  usersToday: number;
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Types pour les composants UI
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Types pour les métadonnées SEO
export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

// Types API Response (from frontend)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

// ===================================
// TOAST TYPES
// ===================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
