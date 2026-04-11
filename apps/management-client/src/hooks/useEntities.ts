import { useState, useCallback } from 'react';
import { useAsync } from './useAsync';
import { entityService } from '../services/entityService';
import type { EntityConfig } from '../types';

export function useEntities() {
  const { data: entities, loading, error, execute: fetchEntities } = useAsync<EntityConfig[]>(
    entityService.getAll,
    true
  );

  const [operationError, setOperationError] = useState<string | null>(null);

  const deleteEntity = async (id: number) => {
    try {
      setOperationError(null);
      await entityService.delete(id);
      await fetchEntities();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to delete entity');
    }
  };

  return { entities: entities || [], loading, error, operationError, fetchEntities, deleteEntity };
}

export function useEntity(id?: string) {
    const fetchEntityById = useCallback(async () => {
        if (!id) return null;
        return await entityService.getById(id);
    }, [id]);

    const { data: entity, loading, error, execute: fetchEntity } = useAsync<EntityConfig | null>(
        fetchEntityById,
        !!id
    );

    return { entity, loading, error, fetchEntity };
}
