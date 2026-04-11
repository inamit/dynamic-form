import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prevState: AsyncState<T>) => ({ ...prevState, loading: true, error: null }));
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    let mounted = true;
    if (immediate) {
      asyncFunction().then(data => {
        if (mounted) setState({ data, loading: false, error: null });
      }).catch(error => {
        if (mounted) {
          const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
          setState({ data: null, loading: false, error: errorMessage });
        }
      });
    }
    return () => { mounted = false; };
  }, [asyncFunction, immediate]);

  return { ...state, execute };
}
