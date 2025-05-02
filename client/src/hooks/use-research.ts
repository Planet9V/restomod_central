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

const cache: Record<string, any> = {};

const useResearch = (options: UseResearchOptions = {}) => {
  const { cacheResults = true, onSuccess, onError } = options;
  const [results, setResults] = useState<ResearchResults>({
    status: 'idle',
    data: null,
    error: null,
  });

  const getCacheKey = (type: ResearchType, params: VehicleResearchParams | PartResearchParams) => {
    if (type === 'vehicle') {
      return `vehicle:${(params as VehicleResearchParams).model}`;
    } else {
      const { part, model } = params as PartResearchParams;
      return `part:${part}${model ? `:${model}` : ''}`;
    }
  };

  const getVehicleResearch = async (params: VehicleResearchParams) => {
    const { model } = params;
    if (!model) {
      throw new Error('Vehicle model is required');
    }

    const cacheKey = getCacheKey('vehicle', params);
    if (cacheResults && cache[cacheKey]) {
      setResults({
        status: 'success',
        data: cache[cacheKey],
        error: null,
      });
      onSuccess?.(cache[cacheKey]);
      return cache[cacheKey];
    }

    try {
      setResults({
        ...results,
        status: 'loading',
      });

      const queryParams = new URLSearchParams({
        model,
      }).toString();

      const responseData = await apiRequest<any>(`/api/research/vehicle?${queryParams}`);

      if (cacheResults) {
        cache[cacheKey] = responseData;
      }

      setResults({
        status: 'success',
        data: responseData,
        error: null,
      });

      onSuccess?.(responseData);
      return responseData;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to fetch vehicle research');
      setResults({
        status: 'error',
        data: null,
        error: errorObj,
      });

      onError?.(errorObj);
      throw errorObj;
    }
  };

  const getPartResearch = async (params: PartResearchParams) => {
    const { part, model } = params;
    if (!part) {
      throw new Error('Part name is required');
    }

    const cacheKey = getCacheKey('part', params);
    if (cacheResults && cache[cacheKey]) {
      setResults({
        status: 'success',
        data: cache[cacheKey],
        error: null,
      });
      onSuccess?.(cache[cacheKey]);
      return cache[cacheKey];
    }

    try {
      setResults({
        ...results,
        status: 'loading',
      });

      const queryParams = new URLSearchParams({
        part,
        ...(model ? { model } : {}),
      }).toString();

      const responseData = await apiRequest<any>(`/api/research/part?${queryParams}`);

      if (cacheResults) {
        cache[cacheKey] = responseData;
      }

      setResults({
        status: 'success',
        data: responseData,
        error: null,
      });

      onSuccess?.(responseData);
      return responseData;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to fetch part research');
      setResults({
        status: 'error',
        data: null,
        error: errorObj,
      });

      onError?.(errorObj);
      throw errorObj;
    }
  };

  const clearCache = (type?: ResearchType, params?: VehicleResearchParams | PartResearchParams) => {
    if (type && params) {
      const cacheKey = getCacheKey(type, params);
      delete cache[cacheKey];
    } else {
      // Clear all cache
      Object.keys(cache).forEach(key => delete cache[key]);
    }
  };

  return {
    results,
    getVehicleResearch,
    getPartResearch,
    clearCache,
    isLoading: results.status === 'loading',
    isSuccess: results.status === 'success',
    isError: results.status === 'error',
  };
};

export default useResearch;
