import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

type ResearchType = 'vehicle' | 'part';

interface UseResearchOptions {
  cacheResults?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface VehicleResearchParams {
  model: string;
}

interface PartResearchParams {
  part: string;
  model?: string;
}

interface ResearchResults {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: any | null;
  error: Error | null;
}

/**
 * Custom hook for fetching vehicle and part research data
 */
export function useResearch(options: UseResearchOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Simple in-memory cache
  const cache: Record<string, any> = {};

  const getCacheKey = (type: ResearchType, params: VehicleResearchParams | PartResearchParams) => {
    if (type === 'vehicle') {
      return `vehicle:${(params as VehicleResearchParams).model}`;
    } else {
      const { part, model } = params as PartResearchParams;
      return `part:${part}:${model || 'general'}`;
    }
  };

  const getVehicleResearch = async (params: VehicleResearchParams) => {
    const cacheKey = getCacheKey('vehicle', params);
    
    // Return cached data if available and caching is enabled
    if (options.cacheResults && cache[cacheKey]) {
      setData(cache[cacheKey]);
      setStatus('success');
      options.onSuccess?.(cache[cacheKey]);
      return cache[cacheKey];
    }
    
    setStatus('loading');
    setError(null);
    
    try {
      const result = await apiRequest(`/research/vehicle?model=${encodeURIComponent(params.model)}`);
      
      // Cache the result if caching is enabled
      if (options.cacheResults) {
        cache[cacheKey] = result;
      }
      
      setData(result);
      setStatus('success');
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch vehicle research');
      setError(errorObj);
      setStatus('error');
      options.onError?.(errorObj);
      throw errorObj;
    }
  };

  const getPartResearch = async (params: PartResearchParams) => {
    const cacheKey = getCacheKey('part', params);
    
    // Return cached data if available and caching is enabled
    if (options.cacheResults && cache[cacheKey]) {
      setData(cache[cacheKey]);
      setStatus('success');
      options.onSuccess?.(cache[cacheKey]);
      return cache[cacheKey];
    }
    
    setStatus('loading');
    setError(null);
    
    try {
      let url = `/research/part?part=${encodeURIComponent(params.part)}`;
      if (params.model) {
        url += `&model=${encodeURIComponent(params.model)}`;
      }
      
      const result = await apiRequest(url);
      
      // Cache the result if caching is enabled
      if (options.cacheResults) {
        cache[cacheKey] = result;
      }
      
      setData(result);
      setStatus('success');
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch part research');
      setError(errorObj);
      setStatus('error');
      options.onError?.(errorObj);
      throw errorObj;
    }
  };

  const clearCache = (type?: ResearchType, params?: VehicleResearchParams | PartResearchParams) => {
    if (type && params) {
      // Clear specific entry
      const cacheKey = getCacheKey(type, params);
      delete cache[cacheKey];
    } else {
      // Clear all cache
      Object.keys(cache).forEach(key => {
        delete cache[key];
      });
    }
  };

  return {
    status,
    data,
    error,
    getVehicleResearch,
    getPartResearch,
    clearCache,
  };
}

export default useResearch;
