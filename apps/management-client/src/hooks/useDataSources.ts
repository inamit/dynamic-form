import { useState, useCallback } from 'react';
import { useAsync } from './useAsync';
import { dataSourceService } from '../services/dataSourceService';
import type { DataSource } from '../types';

export function useDataSources() {
  const { data: dataSources, loading, error, execute: fetchDataSources } = useAsync<DataSource[]>(
    dataSourceService.getAll,
    true
  );

  const [operationError, setOperationError] = useState<string | null>(null);

  const deleteDataSource = async (id: number) => {
    try {
      setOperationError(null);
      await dataSourceService.delete(id);
      await fetchDataSources();
    } catch (e: any) {
      setOperationError(e.message || 'Failed to delete data source');
    }
  };

  return { dataSources: dataSources || [], loading, error, operationError, fetchDataSources, deleteDataSource };
}

export function useDataSource(id?: string) {
    const fetchDataSourceById = useCallback(async () => {
        if (!id) return null;
        return await dataSourceService.getById(id);
    }, [id]);

    const { data: dataSource, loading, error, execute: fetchDataSource } = useAsync<DataSource | undefined | null>(
        fetchDataSourceById,
        !!id
    );

    return { dataSource, loading, error, fetchDataSource };
}
