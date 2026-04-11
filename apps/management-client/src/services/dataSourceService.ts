import apiClient from './apiClient';
import type { DataSource } from '../types';

export const dataSourceService = {
  getAll: async (): Promise<DataSource[]> => {
    const response = await apiClient.get<DataSource[]>('/data-sources');
    return response.data;
  },

  getById: async (id: string | number): Promise<DataSource | undefined> => {
    const dataSources = await dataSourceService.getAll();
    return dataSources.find((ds: DataSource) => ds.id === Number(id));
  },

  create: async (payload: Partial<DataSource>): Promise<void> => {
    await apiClient.post('/data-sources', payload);
  },

  update: async (id: string | number, payload: Partial<DataSource>): Promise<void> => {
    await apiClient.put(`/data-sources/${id}`, payload);
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/data-sources/${id}`);
  }
};
