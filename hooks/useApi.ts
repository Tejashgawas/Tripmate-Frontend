'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import { fetchWithRetry, BASE_URL } from '@/lib/auth';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async <T>(
    method: 'get' | 'post' | 'put' | 'delete'|'patch',
    url: string,
    data?: any
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api[method](url, data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || 
                          axiosError.message || 
                          'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    get: <T>(url: string) => request<T>('get', url),
    post: <T>(url: string, data?: any) => request<T>('post', url, data),
    put: <T>(url: string, data?: any) => request<T>('put', url, data),
    delete: <T>(url: string) => request<T>('delete', url),
    patch: <T>(url: string, data?: any) => request<T>('patch', url, data),

    clearError: () => setError(null)
  };
};
