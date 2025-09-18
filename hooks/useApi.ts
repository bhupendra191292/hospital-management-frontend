import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/services/apiClient';
import { ApiResponse, LoadingState } from '@/types';
import { handleError, getUserFriendlyMessage } from '@/utils/errorHandler';

/**
 * Generic hook for API calls with loading states and error handling
 */
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    cacheKey?: string;
    cacheTime?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  
  const { immediate = true, cacheKey, cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const execute = useCallback(async () => {
    try {
      setLoading('loading');
      setError(null);

      // Check cache if cacheKey is provided
      if (cacheKey && cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey)!;
        const now = Date.now();
        
        if (now - cached.timestamp < cacheTime) {
          setData(cached.data);
          setLoading('success');
          setLastFetched(new Date(cached.timestamp));
          return;
        } else {
          // Remove expired cache
          cacheRef.current.delete(cacheKey);
        }
      }

      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
        setLoading('success');
        setLastFetched(new Date());
        
        // Cache the result if cacheKey is provided
        if (cacheKey) {
          cacheRef.current.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
        }
      } else {
        throw new Error(response.message || 'API call failed');
      }
    } catch (err: any) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      setLoading('error');
      handleError(err, 'useApi Hook Error');
    }
  }, [apiCall, cacheKey, cacheTime]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cacheRef.current.delete(cacheKey);
    }
  }, [cacheKey]);

  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch,
    clearCache,
    clearAllCache,
  };
}

/**
 * Hook for patient-related API calls
 */
export function usePatients(params?: any) {
  return useApi(
    () => apiClient.getPatients(params),
    [params],
    { cacheKey: `patients_${JSON.stringify(params)}` }
  );
}

export function usePatient(id: string) {
  return useApi(
    () => apiClient.getPatient(id),
    [id],
    { cacheKey: `patient_${id}` }
  );
}

export function usePatientVisits(patientId: string) {
  return useApi(
    () => apiClient.getVisits(patientId),
    [patientId],
    { cacheKey: `visits_${patientId}` }
  );
}

/**
 * Hook for appointments
 */
export function useAppointments(params?: any) {
  return useApi(
    () => apiClient.getAppointments(params),
    [params],
    { cacheKey: `appointments_${JSON.stringify(params)}` }
  );
}

/**
 * Hook for analytics data
 */
export function useAnalyticsTrends(params?: any) {
  return useApi(
    () => apiClient.getAnalyticsTrends(params),
    [params],
    { cacheKey: `analytics_${JSON.stringify(params)}` }
  );
}

export function useDashboardSummary() {
  return useApi(
    () => apiClient.getDashboardSummary(),
    [],
    { cacheKey: 'dashboard_summary', cacheTime: 2 * 60 * 1000 } // 2 minutes
  );
}

/**
 * Hook for form submission with loading states
 */
export function useFormSubmission<T, R>(
  submitFn: (data: T) => Promise<ApiResponse<R>>,
  options: {
    onSuccess?: (data: R) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data: T) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await submitFn(data);
      
      if (response.success) {
        setSuccess(true);
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (err: any) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      options.onError?.(errorMessage);
      handleError(err, 'Form Submission Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [submitFn, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset,
  };
}

/**
 * Hook for authentication
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: { phone: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.login(credentials);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      handleError(err, 'Authentication Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (err: any) {
      handleError(err, 'Logout Error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    loading,
    error,
  };
}

/**
 * Hook for file uploads
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    uploadFn: (file: File) => Promise<any>
  ) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress (in real implementation, use axios progress callback)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadFn(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return result;
    } catch (err: any) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      handleError(err, 'File Upload Error');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
  };
}

/**
 * Hook for real-time data updates
 */
export function useRealtimeData<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  interval: number = 30000, // 30 seconds
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn();
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      handleError(err, 'Realtime Data Error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval
    intervalRef.current = setInterval(fetchData, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, ...dependencies]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchData, interval);
    }
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    stopPolling,
    startPolling,
  };
}
