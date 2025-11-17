import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/services/api-client';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Hook for markets
export function useMarkets() {
  return useApi(() => apiClient.get('markets'), []);
}

// Hook for single market
export function useMarket(marketId: string) {
  return useApi(() => apiClient.get(`markets/${marketId}`), [marketId]);
}

// Hook for user bets
export function useUserBets(userId: string) {
  return useApi(() => apiClient.get(`bets/user/${userId}`), [userId]);
}

// Hook for pending markets
export function usePendingMarkets() {
  return useApi(() => apiClient.get('resolution/pending'), []);
}

// Hook for manual operations
export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(params);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'An error occurred');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { mutate, loading, error };
}
