import apiClient from './apiClient';
import type { EntityConfig, SchemaDefinition } from '../types';
import type {Enums} from "@dynamic-form/shared-ui";

export const entityService = {
  getAll: async (): Promise<EntityConfig[]> => {
    const response = await apiClient.get<EntityConfig[]>('/config');
    return response.data;
  },

  getById: async (id: string | number): Promise<EntityConfig> => {
    const response = await apiClient.get<EntityConfig>(`/config/id/${id}`);
    return response.data;
  },

  create: async (payload: Partial<EntityConfig>): Promise<void> => {
    await apiClient.post('/config/new', payload);
  },

  update: async (id: string | number, payload: Partial<EntityConfig>): Promise<void> => {
    await apiClient.put(`/config/${id}`, payload);
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/config/${id}`);
  },

  getAvailableSchemas: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/schemas');
    return response.data;
  },

  getSchemaDefinition: async (schemaName: string): Promise<SchemaDefinition> => {
    const response = await apiClient.get<SchemaDefinition>(`/schema/${schemaName}`);
    return response.data;
  },

  getEnums: async (): Promise<Enums> => {
    const response = await apiClient.get<Enums>(`/enums`);
    return response.data;
  },

  introspectGraphQL: async (url: string, headers: string) => {
    const response = await apiClient.post('/introspect', { url, headers });
    return response.data;
  }
};
