/**
 * Data Management API - Admin interface for managing all database tables
 */

import apiClient, { unwrapResponse } from './apiClient';
import type { ApiResponse } from '../types/api';

// ============================================================================
// Types
// ============================================================================

export interface EntityMetadata {
  name: string;
  displayName: string;
  tableName: string;
  fields: FieldMetadata[];
}

export interface FieldMetadata {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'relation';
  nullable: boolean;
  editable: boolean;
  primaryKey: boolean;
  enumValues?: string[];
  relation?: RelationInfo;
}

export interface RelationInfo {
  entityType: string;
  displayField: string;
}

export interface EntityDataResponse<T = any> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface GetEntityDataParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Data Management API
// ============================================================================

export const dataManagementApi = {
  /**
   * Get metadata for all available entities
   * GET /api/admin/data/metadata
   */
  async getEntityMetadata(): Promise<EntityMetadata[]> {
    const response = await apiClient.get<ApiResponse<EntityMetadata[]>>(
      '/api/admin/data/metadata'
    );
    return unwrapResponse(response);
  },

  /**
   * Get all data for a specific entity type with pagination
   * GET /api/admin/data/{entityType}
   */
  async getEntityData<T = any>(
    entityType: string,
    params: GetEntityDataParams = {}
  ): Promise<EntityDataResponse<T>> {
    const {
      page = 0,
      size = 20,
      sortBy = 'id',
      sortDirection = 'desc',
    } = params;

    const response = await apiClient.get<EntityDataResponse<T>>(
      `/api/admin/data/${entityType}`,
      {
        params: {
          page,
          size,
          sortBy,
          sortDirection,
        },
      }
    );
    return response.data;
  },

  /**
   * Get a specific entity by ID
   * GET /api/admin/data/{entityType}/{id}
   */
  async getEntityById<T = any>(entityType: string, id: number): Promise<T> {
    const response = await apiClient.get<T>(
      `/api/admin/data/${entityType}/${id}`
    );
    return response.data;
  },

  /**
   * Update an entity
   * PUT /api/admin/data/{entityType}/{id}
   */
  async updateEntity<T = any>(
    entityType: string,
    id: number,
    updates: Record<string, any>
  ): Promise<T> {
    const response = await apiClient.put<T>(
      `/api/admin/data/${entityType}/${id}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete an entity
   * DELETE /api/admin/data/{entityType}/{id}
   */
  async deleteEntity(entityType: string, id: number): Promise<void> {
    await apiClient.delete(`/api/admin/data/${entityType}/${id}`);
  },
};

export default dataManagementApi;
