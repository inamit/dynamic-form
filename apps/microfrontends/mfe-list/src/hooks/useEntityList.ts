import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.service';
import type { EntityConfig } from '../types';

export function useEntityList(entity: string | null) {
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abilities, setAbilities] = useState({ canCreate: false, canEdit: false, canDelete: false, canView: false });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (currentEntity: string) => {
    setLoading(true);
    setError(null);
    try {
      const [configData, abilitiesData, listData] = await Promise.all([
        ApiService.getConfig(currentEntity),
        ApiService.getAbilities(currentEntity),
        ApiService.getData(currentEntity)
      ]);
      setConfig(configData);
      setAbilities(abilitiesData);
      setData(listData);
    } catch (e: any) {
      console.error('Failed to load entity data', e);
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entity) {
      fetchData(entity);
    } else {
      setLoading(false);
    }
  }, [entity, fetchData]);

  const handleDelete = async (id: string) => {
    if (!entity) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await ApiService.deleteData(entity, id);
      await fetchData(entity);
    } catch (e) {
      console.error('Failed to delete', e);
      alert('Failed to delete item.');
    }
  };

  return {
    config,
    data,
    loading,
    abilities,
    error,
    handleDelete
  };
}
