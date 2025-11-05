/**
 * Axios HTTP Client Configuration
 * Handles authentication, errors, and request/response transformations
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse } from '../types/api';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Axios instance with base configuration
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

/**
 * Add JWT token to requests if available
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

// ============================================================================
// Response Interceptor
// ============================================================================

/**
 * Handle successful responses and errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
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
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle specific error cases (client side only)
    if (typeof window !== 'undefined') {
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401: {
            // Unauthorized - Token expired or invalid
            handleUnauthorized();
            break;
          }

          case 403: {
            // Forbidden - Insufficient permissions
            console.warn('[API] Access denied:', data.message);
            break;
          }

          case 404: {
            // Not Found
            console.warn('[API] Resource not found:', data.message);
            break;
          }

          case 409: {
            // Conflict - Duplicate resource
            console.warn('[API] Conflict:', data.message);
            break;
          }

          case 422: {
            // Validation Error
            console.warn('[API] Validation failed:', data.validationErrors);
            break;
          }

          case 429: {
            // Rate limit exceeded
            console.warn('[API] Rate limit exceeded');
            break;
          }

          case 500: {
            // Internal Server Error
            console.error('[API] Server error:', data.message);
            break;
          }

          default: {
            console.error('[API] Unexpected error:', data.message);
          }
        }
      } else if (error.request) {
        // Request made but no response received
        console.error('[API] No response from server:', error.message);
      } else {
        // Error setting up the request
        console.error('[API] Request setup error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Handle 401 Unauthorized errors
 * Clear token and redirect to login
 */
function handleUnauthorized() {
  if (typeof window === 'undefined') return;

  console.warn('[API] Session expired or unauthorized');

  // Clear auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  // Redirect to login if not already there
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=true';
  }
}

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
  if (isErrorResponse(error)) {
    const errorData = error.response?.data;

    // Validation errors
    if (errorData.validationErrors) {
      const errors = Object.values(errorData.validationErrors);
      return errors.length > 0 ? errors[0] : errorData.message;
    }

    // Standard error message
    return errorData.message || 'An unexpected error occurred';
  }

  // Network or other errors
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
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

// ============================================================================
// Export
// ============================================================================

export default apiClient;
