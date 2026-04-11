import apiClient from './apiClient';
import type { SitePermission, UserPermission } from '../types';

export const permissionService = {
  getSitePermissions: async (): Promise<SitePermission[]> => {
    // API endpoint based on previous file exploration
    const response = await apiClient.get<SitePermission[]>('http://localhost:3002/api/site-permissions');
    return response.data;
  },

  createSitePermission: async (payload: Omit<SitePermission, 'id'>): Promise<void> => {
    await apiClient.post('http://localhost:3002/api/site-permissions', payload);
  },

  deleteSitePermission: async (id: number): Promise<void> => {
    await apiClient.delete(`http://localhost:3002/api/site-permissions/${id}`);
  },

  getUserPermissions: async (): Promise<UserPermission[]> => {
    const response = await apiClient.get<UserPermission[]>('http://localhost:3002/api/user-permissions');
    return response.data;
  },

  createUserPermission: async (payload: Omit<UserPermission, 'id'>): Promise<void> => {
    await apiClient.post('http://localhost:3002/api/user-permissions', payload);
  },

  deleteUserPermission: async (id: number): Promise<void> => {
    await apiClient.delete(`http://localhost:3002/api/user-permissions/${id}`);
  }
};
