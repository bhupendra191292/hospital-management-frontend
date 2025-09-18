import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi, useFormSubmission, useAuth, useFileUpload } from '../useApi';
import { mockApiResponse, mockErrorResponse } from '../../test/utils';

// Mock the API client
vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getPatients: vi.fn(),
    getPatient: vi.fn(),
    getVisits: vi.fn(),
    getAppointments: vi.fn(),
    getAnalyticsTrends: vi.fn(),
    getDashboardSummary: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Generic useApi', () => {
    it('should fetch data successfully', async () => {
      const mockData = { patients: [] };
      const mockApiCall = vi.fn().mockResolvedValue(mockApiResponse(mockData));

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe('success');
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe('error');
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should support caching', async () => {
      const mockData = { patients: [] };
      const mockApiCall = vi.fn().mockResolvedValue(mockApiResponse(mockData));

      const { result, rerender } = renderHook(
        () => useApi(mockApiCall, [], { cacheKey: 'test-cache' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe('success');
      });

      // Rerender should use cached data
      rerender();
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should support refetching', async () => {
      const mockData = { patients: [] };
      const mockApiCall = vi.fn().mockResolvedValue(mockApiResponse(mockData));

      const { result } = renderHook(() => useApi(mockApiCall));

      await waitFor(() => {
        expect(result.current.loading).toBe('success');
      });

      result.current.refetch();

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should not execute immediately when immediate is false', () => {
      const mockApiCall = vi.fn();

      renderHook(() => useApi(mockApiCall, [], { immediate: false }));

      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('useFormSubmission', () => {
    it('should handle successful submission', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockSubmitFn = vi.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useFormSubmission(mockSubmitFn, { onSuccess })
      );

      const formData = { name: 'Test' };
      await result.current.submit(formData);

      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should handle submission errors', async () => {
      const mockSubmitFn = vi.fn().mockRejectedValue(new Error('Submission failed'));
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useFormSubmission(mockSubmitFn, { onError })
      );

      const formData = { name: 'Test' };
      
      try {
        await result.current.submit(formData);
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });

    it('should reset form state', () => {
      const mockSubmitFn = vi.fn();
      const { result } = renderHook(() => useFormSubmission(mockSubmitFn));

      result.current.reset();

      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useAuth', () => {
    it('should handle successful login', async () => {
      const mockLoginData = { token: 'test-token', doctor: { id: '1' } };
      vi.mocked(require('../../services/apiClient').apiClient.login).mockResolvedValue({
        success: true,
        data: mockLoginData,
      });

      const { result } = renderHook(() => useAuth());

      const credentials = { phone: '1234567890', password: 'password' };
      const data = await result.current.login(credentials);

      expect(data).toEqual(mockLoginData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login errors', async () => {
      vi.mocked(require('../../services/apiClient').apiClient.login).mockRejectedValue(
        new Error('Login failed')
      );

      const { result } = renderHook(() => useAuth());

      const credentials = { phone: '1234567890', password: 'wrong' };
      
      try {
        await result.current.login(credentials);
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('should handle logout', async () => {
      const mockLogoutFn = vi.fn().mockResolvedValue(mockApiResponse({}));

      const { result } = renderHook(() => useAuth());

      await result.current.logout();

      expect(result.current.loading).toBe(false);
    });
  });

  describe('useFileUpload', () => {
    it('should handle successful file upload', async () => {
      const mockUploadFn = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const uploadResult = await result.current.uploadFile(file, mockUploadFn);

      expect(uploadResult).toEqual({ success: true });
      expect(result.current.uploading).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(result.current.error).toBeNull();
    });

    it('should handle upload errors', async () => {
      const mockUploadFn = vi.fn().mockRejectedValue(new Error('Upload failed'));
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      try {
        await result.current.uploadFile(file, mockUploadFn);
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.uploading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('should track upload progress', async () => {
      const mockUploadFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      const uploadPromise = result.current.uploadFile(file, mockUploadFn);
      
      // Check progress during upload
      expect(result.current.uploading).toBe(true);
      expect(result.current.progress).toBeGreaterThan(0);
      
      await uploadPromise;
      
      expect(result.current.progress).toBe(100);
    });
  });
});
