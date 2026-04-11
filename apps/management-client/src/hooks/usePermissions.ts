import { useState } from 'react';
import { useAsync } from './useAsync';
import { permissionService } from '../services/permissionService';
import type { SitePermission, UserPermission } from '../types';

export function useSitePermissions() {
  const { data: permissions, loading, error, execute: fetchPermissions } = useAsync<SitePermission[]>(
    permissionService.getSitePermissions,
    true
  );

  const [operationError, setOperationError] = useState<string | null>(null);

  const addPermission = async (payload: Omit<SitePermission, 'id'>) => {
    try {
      setOperationError(null);
      await permissionService.createSitePermission(payload);
      await fetchPermissions();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to add permission');
    }
  };

  const deletePermission = async (id: number) => {
    try {
      setOperationError(null);
      await permissionService.deleteSitePermission(id);
      await fetchPermissions();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to delete permission');
    }
  };

  return { permissions: permissions || [], loading, error, operationError, addPermission, deletePermission, fetchPermissions };
}

export function useUserPermissions() {
  const { data: permissions, loading, error, execute: fetchPermissions } = useAsync<UserPermission[]>(
    permissionService.getUserPermissions,
    true
  );

  const [operationError, setOperationError] = useState<string | null>(null);

  const addPermission = async (payload: Omit<UserPermission, 'id'>) => {
    try {
      setOperationError(null);
      await permissionService.createUserPermission(payload);
      await fetchPermissions();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to add permission');
    }
  };

  const deletePermission = async (id: number) => {
    try {
      setOperationError(null);
      await permissionService.deleteUserPermission(id);
      await fetchPermissions();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to delete permission');
    }
  };

  return { permissions: permissions || [], loading, error, operationError, addPermission, deletePermission, fetchPermissions };
}
