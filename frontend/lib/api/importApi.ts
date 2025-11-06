import apiClient from './apiClient';

// ============================================
// TypeScript Interfaces (matching backend DTOs)
// ============================================

export interface ImportRoasterRequest {
  id?: number;
  name: string;
  description?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  isVerified?: boolean;
}

export interface ImportCoffeeRequest {
  id?: number;
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
  noteIds?: number[];
  noteNames?: string[];
  submittedById?: number;
  autoApprove?: boolean;
}

export interface BatchImportRequest {
  continueOnError?: boolean;
  autoApprove?: boolean;
  roasters?: ImportRoasterRequest[];
  coffees?: ImportCoffeeRequest[];
}

export type ImportOperation = 'CREATE' | 'UPDATE' | 'SKIP' | 'ERROR';
export type ImportEntityType = 'ROASTER' | 'COFFEE';

export interface ImportResult {
  entityType: ImportEntityType;
  operation: ImportOperation;
  entityId?: number;
  entityName: string;
  success: boolean;
  errorMessage?: string;
  warning?: string;
}

export interface ImportResponse {
  timestamp: string;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  skipCount: number;
  createCount: number;
  updateCount: number;
  results: ImportResult[];
  message: string;
}

// ============================================
// API Methods
// ============================================

export const importApi = {
  /**
   * Import a single roaster
   */
  importRoaster: async (data: ImportRoasterRequest): Promise<ImportResult> => {
    const response = await apiClient.post('/api/import/roaster', data);
    return response.data.data;
  },

  /**
   * Import a single coffee
   */
  importCoffee: async (data: ImportCoffeeRequest): Promise<ImportResult> => {
    const response = await apiClient.post('/api/import/coffee', data);
    return response.data.data;
  },

  /**
   * Batch import roasters and coffees
   */
  batchImport: async (data: BatchImportRequest): Promise<ImportResponse> => {
    const response = await apiClient.post('/api/import/batch', data);
    return response.data.data;
  },

  /**
   * Import multiple roasters
   */
  importRoasters: async (data: ImportRoasterRequest[]): Promise<ImportResponse> => {
    const response = await apiClient.post('/api/import/roasters', data);
    return response.data.data;
  },

  /**
   * Import multiple coffees
   */
  importCoffees: async (
    data: ImportCoffeeRequest[],
    autoApprove: boolean = false
  ): Promise<ImportResponse> => {
    const response = await apiClient.post(
      `/api/import/coffees?autoApprove=${autoApprove}`,
      data
    );
    return response.data.data;
  },

  /**
   * Health check for import service
   */
  health: async (): Promise<string> => {
    const response = await apiClient.get('/api/import/health');
    return response.data.data;
  },
};

// ============================================
// Validation Helpers
// ============================================

export const validateImportJSON = (jsonString: string): {
  valid: boolean;
  data?: BatchImportRequest;
  error?: string;
} => {
  try {
    const data = JSON.parse(jsonString);

    // Basic validation
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid JSON format' };
    }

    if (!data.roasters && !data.coffees) {
      return { valid: false, error: 'Must provide either roasters or coffees array' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON syntax: ' + (error as Error).message };
  }
};

export const getImportErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred during import';
};
