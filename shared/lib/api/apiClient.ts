/**
 * Axios HTTP Client Configuration (Shared Version)
 * Base configuration for API client with rate limiting support
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ErrorResponse } from '../../types';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Main API client instance
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Rate Limiting State Management (2025 Best Practices)
// ============================================================================

export interface RateLimitInfo {
  limit: number;           // X-RateLimit-Limit: maximum requests allowed
  remaining: number;       // X-RateLimit-Remaining: requests remaining
  reset: number;           // X-RateLimit-Reset: epoch seconds when limit resets
  retryAfter?: number;     // Retry-After: seconds to wait (only on 429)
}

/**
 * Global rate limit state
 * Tracks current rate limit status from response headers
 */
const rateLimitState: RateLimitInfo = {
  limit: 0,
  remaining: 0,
  reset: 0,
};

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): RateLimitInfo {
  return { ...rateLimitState };
}

/**
 * Check if rate limit is close to being exceeded
 * Returns true if less than 10% remaining or less than 5 requests left
 */
export function isRateLimitWarning(): boolean {
  if (rateLimitState.limit === 0) return false;
  const percentage = rateLimitState.remaining / rateLimitState.limit;
  return percentage < 0.1 || rateLimitState.remaining < 5;
}

/**
 * Extract rate limit headers from response
 */
export function extractRateLimitHeaders(response: AxiosResponse): void {
  const headers = response.headers;

  if (headers['x-ratelimit-limit']) {
    rateLimitState.limit = parseInt(headers['x-ratelimit-limit'], 10);
  }

  if (headers['x-ratelimit-remaining']) {
    rateLimitState.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
  }

  if (headers['x-ratelimit-reset']) {
    rateLimitState.reset = parseInt(headers['x-ratelimit-reset'], 10);
  }

  // Log warning if close to limit
  if (isRateLimitWarning() && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('[API] Rate limit warning:', {
      remaining: rateLimitState.remaining,
      limit: rateLimitState.limit,
      resetAt: new Date(rateLimitState.reset * 1000).toLocaleTimeString(),
    });
  }
}

// ============================================================================
// Interceptors Setup
// ============================================================================

/**
 * Request interceptor for authentication
 * Adds JWT token from localStorage if available
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for rate limiting and error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract rate limit headers from all responses
    extractRateLimitHeaders(response);

    // Log response in development (client side only)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    // Log error in development (client side only)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.group('[API Error]');
      console.log('Message:', error.message);
      console.log('URL:', error.config?.url || 'unknown');
      console.log('Method:', error.config?.method?.toUpperCase() || 'unknown');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', error.response?.data);
      console.log('Error Code:', error.code);
      console.groupEnd();
    }

    // Handle specific error cases (client side only)
    if (typeof window !== 'undefined' && error.response) {
      const { status } = error.response;

      switch (status) {
        case 401: {
          // Unauthorized - Token expired or invalid
          // Applications can listen for this and handle accordingly
          break;
        }

        case 429: {
          // Rate limit exceeded - Extract retry information
          const retryAfter = error.response.headers['retry-after'];
          const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

          // Extract rate limit headers from error response
          extractRateLimitHeaders(error.response);
          rateLimitState.retryAfter = retryAfterSeconds;

          // Calculate retry time
          const retryTime = new Date(Date.now() + retryAfterSeconds * 1000).toLocaleTimeString();

          console.warn('[API] Rate limit exceeded:', {
            retryAfter: `${retryAfterSeconds}s`,
            retryAt: retryTime,
            limit: rateLimitState.limit,
            remaining: rateLimitState.remaining,
          });

          // Attempt automatic retry for non-sensitive endpoints
          const config = error.config;
          const isSensitiveEndpoint = config?.url?.includes('/auth/login') ||
                                     config?.url?.includes('/auth/register') ||
                                     config?.url?.includes('/auth/reset-password');

          // Only auto-retry for GET requests on non-sensitive endpoints
          // and if retry delay is reasonable (less than 10 seconds)
          if (config &&
              config.method?.toLowerCase() === 'get' &&
              !isSensitiveEndpoint &&
              retryAfterSeconds <= 10 &&
              !(config as any)._retried) {

            console.log(`[API] Auto-retrying request after ${retryAfterSeconds}s...`);

            // Mark request as retried to prevent infinite loops
            (config as any)._retried = true;

            // Wait for the specified retry time
            await new Promise(resolve => setTimeout(resolve, retryAfterSeconds * 1000));

            // Retry the request
            return apiClient.request(config);
          }

          break;
        }

        default: {
          // Log other errors
          if (process.env.NODE_ENV === 'development') {
            console.error('[API] Error:', error.response.data);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract data from ApiResponse wrapper
 */
export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
}

/**
 * Check if error is an ErrorResponse
 */
export function isErrorResponse(error: unknown): error is AxiosError<ErrorResponse> {
  return (
    error instanceof Error &&
    'response' in error &&
    error.response !== undefined &&
    error.response !== null &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'success' in error.response.data &&
    error.response.data.success === false
  );
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  // Check if it's an Axios error with response
  if (isErrorResponse(error)) {
    const errorData = error.response?.data;

    if (errorData) {
      // Validation errors
      if (errorData.validationErrors) {
        const errors = Object.values(errorData.validationErrors);
        return errors.length > 0 ? errors[0] : errorData.message;
      }

      // Standard error message
      return errorData.message || 'Une erreur est survenue';
    }
  }

  // Check if it's a basic Axios error (without proper ErrorResponse structure)
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;

    // Try to extract message from response data
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Try different message formats
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }

    // Fallback to status text
    if (axiosError.response?.status === 401) {
      return 'Email ou mot de passe incorrect';
    }
    if (axiosError.response?.status === 403) {
      return 'Accès refusé';
    }
    if (axiosError.response?.status === 404) {
      return 'Ressource non trouvée';
    }
    if (axiosError.response?.status === 429) {
      const retryAfter = axiosError.response.headers['retry-after'];
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      return `Limite de requêtes atteinte. Réessayez dans ${seconds} secondes.`;
    }
    if (axiosError.response?.status >= 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return axiosError.response?.statusText || 'Une erreur est survenue';
  }

  // Network or other errors
  if (error instanceof Error) {
    // Network error
    if (error.message === 'Network Error') {
      return 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    }
    return error.message;
  }

  return 'Une erreur inattendue est survenue';
}

/**
 * Get all validation errors from API error
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (isErrorResponse(error)) {
    return error.response?.data.validationErrors || null;
  }
  return null;
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Set authentication token
 */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * Remove authentication token
 */
export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
