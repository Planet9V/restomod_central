import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Process the text response from Perplexity API into a structured format
 */
function processPerplexityResponse(content: string): Record<string, any> {
  // Default structure for the processed data
  const result: Record<string, any> = {
    overview: '',
    specifications: {},
    history: '',
    marketTrends: '',
    valueRange: '',
    factorsAffectingValue: [],
    commonUpgrades: [],
    restomodOptions: [],
    recommendedParts: [],
    compatibility: '',
    keyMoments: [],
    notableExamples: [],
    investmentPotential: ''
  };
  
  // Detect sections based on common headers
  const sections = content.split(/\n#{1,3}\s+/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n');
    const title = lines[0].trim().toLowerCase();
    const body = lines.slice(1).join('\n').trim();
    
    // Map the section to the appropriate field in our result structure
    if (title.includes('overview') || title.includes('introduction') || title.includes('significance')) {
      result.overview = body;
    } else if (title.includes('specification') || title.includes('specs')) {
      // Try to extract key-value pairs from the specifications section
      const specs: Record<string, string> = {};
      const specLines = body.split('\n');
      
      for (const line of specLines) {
        const match = line.match(/^([\w\s]+):(.+)$/);
        if (match) {
          const [, key, value] = match;
          specs[key.trim()] = value.trim();
        }
      }
      
      if (Object.keys(specs).length > 0) {
        result.specifications = specs;
      } else {
        result.specifications = { 'General': body };
      }
    } else if (title.includes('history') || title.includes('background') || title.includes('context')) {
      result.history = body;
    } else if (title.includes('market value') || title.includes('price') || title.includes('market trends')) {
      result.marketTrends = body;
      
      // Try to extract value range if mentioned
      const valueRangeMatch = body.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
      if (valueRangeMatch) {
        result.valueRange = `$${valueRangeMatch[1]} - $${valueRangeMatch[2]}`;
      }
    } else if (title.includes('factors affecting value')) {
      // Extract bullet points if present
      const factors = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (factors.length > 0) {
        result.factorsAffectingValue = factors;
      } else {
        result.factorsAffectingValue = [body];
      }
    } else if (title.includes('upgrades') || title.includes('modifications')) {
      // Extract bullet points if present
      const upgrades = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (upgrades.length > 0) {
        result.commonUpgrades = upgrades;
      } else {
        result.commonUpgrades = [body];
      }
    } else if (title.includes('restomod')) {
      // Extract bullet points if present
      const options = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (options.length > 0) {
        result.restomodOptions = options;
      } else {
        result.restomodOptions = [body];
      }
    } else if (title.includes('recommended parts') || title.includes('parts and modifications')) {
      // Extract bullet points if present
      const parts = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (parts.length > 0) {
        result.recommendedParts = parts;
      } else {
        result.recommendedParts = [body];
      }
    } else if (title.includes('compatibility')) {
      result.compatibility = body;
    } else if (title.includes('key moments') || title.includes('key dates')) {
      // Extract bullet points if present
      const moments = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (moments.length > 0) {
        result.keyMoments = moments;
      } else {
        result.keyMoments = [body];
      }
    } else if (title.includes('notable examples') || title.includes('special editions')) {
      // Extract bullet points if present
      const examples = body.split(/\n-\s+|\n\d+\.\s+/).filter(Boolean);
      if (examples.length > 0) {
        result.notableExamples = examples;
      } else {
        result.notableExamples = [body];
      }
    } else if (title.includes('investment potential') || title.includes('investment')) {
      result.investmentPotential = body;
    }
  }
  
  return result;
}

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
      // First try the Perplexity endpoint which will have more detailed information
      try {
        const result = await apiRequest(`/perplexity/car-info?model=${encodeURIComponent(params.model)}`);
        
        if (result.success && result.content) {
          // Process the response into a structured format
          const processedData = processPerplexityResponse(result.content);
          
          // Cache the result if caching is enabled
          if (options.cacheResults) {
            cache[cacheKey] = processedData;
          }
          
          setData(processedData);
          setStatus('success');
          options.onSuccess?.(processedData);
          return processedData;
        }
      } catch (perplexityError) {
        console.warn('Perplexity API error, falling back to research API:', perplexityError);
      }
      
      // Fallback to the original research endpoint
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
      // Try the Perplexity endpoint first for more detailed information
      try {
        let url = `/perplexity/part-info?part=${encodeURIComponent(params.part)}`;
        if (params.model) {
          url += `&model=${encodeURIComponent(params.model)}`;
        }
        
        const result = await apiRequest(url);
        
        if (result.success && result.content) {
          // Process the response into a structured format
          const processedData = processPerplexityResponse(result.content);
          
          // Cache the result if caching is enabled
          if (options.cacheResults) {
            cache[cacheKey] = processedData;
          }
          
          setData(processedData);
          setStatus('success');
          options.onSuccess?.(processedData);
          return processedData;
        }
      } catch (perplexityError) {
        console.warn('Perplexity API error, falling back to research API:', perplexityError);
      }
      
      // Fallback to the original research endpoint
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
