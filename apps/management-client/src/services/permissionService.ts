import apiClient from './apiClient';
import type { SitePermission, UserPermission } from '../types';

const PERMISSIONS_API_BASE_URL = 'http://localhost:3002/api';

export const permissionService = {
  getSitePermissions: async (): Promise<SitePermission[]> => {
    const response = await apiClient.get<SitePermission[]>(`${PERMISSIONS_API_BASE_URL}/site-permissions`);
    return response.data;
  },

  createSitePermission: async (payload: Omit<SitePermission, 'id'>): Promise<void> => {
    await apiClient.post(`${PERMISSIONS_API_BASE_URL}/site-permissions`, payload);
  },

  deleteSitePermission: async (id: number): Promise<void> => {
    await apiClient.delete(`${PERMISSIONS_API_BASE_URL}/site-permissions/${id}`);
  },

  getUserPermissions: async (): Promise<UserPermission[]> => {
    const response = await apiClient.get<UserPermission[]>(`${PERMISSIONS_API_BASE_URL}/user-permissions`);
    return response.data;
  },

  createUserPermission: async (payload: Omit<UserPermission, 'id'>): Promise<void> => {
    await apiClient.post(`${PERMISSIONS_API_BASE_URL}/user-permissions`, payload);
  },

  deleteUserPermission: async (id: number): Promise<void> => {
    await apiClient.delete(`${PERMISSIONS_API_BASE_URL}/user-permissions/${id}`);
  }
};
