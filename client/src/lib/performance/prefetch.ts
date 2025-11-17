/**
 * Prefetch Utilities
 *
 * Provides utilities for prefetching routes, data, and resources
 * to improve perceived performance.
 */

import { useEffect, useRef } from 'react';

/**
 * Prefetch priorities
 */
export type PrefetchPriority = 'high' | 'low' | 'auto';

/**
 * Prefetch a URL
 *
 * @param url - URL to prefetch
 * @param priority - Prefetch priority
 */
export function prefetchUrl(url: string, priority: PrefetchPriority = 'low') {
  if (typeof document === 'undefined') return;

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';

  // Set fetchpriority if supported
  if ('fetchPriority' in HTMLLinkElement.prototype) {
    (link as any).fetchPriority = priority;
  }

  document.head.appendChild(link);
}

/**
 * Preload a resource
 *
 * @param url - URL to preload
 * @param as - Resource type (script, style, font, image, etc.)
 * @param type - MIME type (optional)
 * @param crossOrigin - CORS mode (optional)
 */
export function preloadResource(
  url: string,
  as: 'script' | 'style' | 'font' | 'image' | 'fetch' | 'document',
  options: {
    type?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
    priority?: PrefetchPriority;
  } = {}
) {
  if (typeof document === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;

  if (options.type) {
    link.type = options.type;
  }

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.priority && 'fetchPriority' in HTMLLinkElement.prototype) {
    (link as any).fetchPriority = options.priority;
  }

  document.head.appendChild(link);
}

/**
 * Preconnect to a domain
 *
 * @param url - Domain URL to preconnect
 * @param crossOrigin - Whether to use CORS
 */
export function preconnect(url: string, crossOrigin = false) {
  if (typeof document === 'undefined') return;

  // Check if already preconnected
  const existing = document.querySelector(`link[rel="preconnect"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;

  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * DNS prefetch a domain
 *
 * @param url - Domain URL to DNS prefetch
 */
export function dnsPrefetch(url: string) {
  if (typeof document === 'undefined') return;

  // Check if already DNS prefetched
  const existing = document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;

  document.head.appendChild(link);
}

/**
 * Hook to prefetch route on hover
 *
 * @param href - Route to prefetch
 *
 * @example
 * ```tsx
 * const prefetchProps = usePrefetchOnHover('/cars-for-sale');
 * return <a href="/cars-for-sale" {...prefetchProps}>Cars</a>;
 * ```
 */
export function usePrefetchOnHover(href: string) {
  const hasPrefetched = useRef(false);

  const handleMouseEnter = () => {
    if (!hasPrefetched.current) {
      prefetchUrl(href);
      hasPrefetched.current = true;
    }
  };

  const handleTouchStart = () => {
    if (!hasPrefetched.current) {
      prefetchUrl(href);
      hasPrefetched.current = true;
    }
  };

  return {
    onMouseEnter: handleMouseEnter,
    onTouchStart: handleTouchStart,
  };
}

/**
 * Hook to prefetch route on viewport intersection
 *
 * @param href - Route to prefetch
 * @param options - IntersectionObserver options
 *
 * @example
 * ```tsx
 * const ref = usePrefetchOnViewport('/cars-for-sale');
 * return <a ref={ref} href="/cars-for-sale">Cars</a>;
 * ```
 */
export function usePrefetchOnViewport<T extends HTMLElement = HTMLAnchorElement>(
  href: string,
  options: IntersectionObserverInit = {}
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const hasPrefetched = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasPrefetched.current) return;

    if (!('IntersectionObserver' in window)) {
      prefetchUrl(href);
      hasPrefetched.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPrefetched.current) {
          prefetchUrl(href);
          hasPrefetched.current = true;
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [href, options]);

  return ref;
}

/**
 * Prefetch data with fetch
 *
 * @param url - API endpoint to prefetch
 * @param options - Fetch options
 * @returns Promise with response
 */
export async function prefetchData<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      // Set low priority for prefetch
      priority: 'low' as any,
    });

    if (!response.ok) {
      throw new Error(`Prefetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error prefetching data:', error);
    return null;
  }
}

/**
 * Hook to prefetch data
 *
 * @param url - API endpoint to prefetch
 * @param enabled - Whether to prefetch
 *
 * @example
 * ```tsx
 * usePrefetchData('/api/cars', true);
 * ```
 */
export function usePrefetchData(url: string, enabled = true) {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (enabled && !hasPrefetched.current) {
      prefetchData(url);
      hasPrefetched.current = true;
    }
  }, [url, enabled]);
}

/**
 * Prefetch critical resources
 * Call this on app initialization
 */
export function prefetchCriticalResources() {
  // Preconnect to important domains
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', true);
  preconnect('https://res.cloudinary.com', true);

  // DNS prefetch for analytics
  dnsPrefetch('https://app.posthog.com');
  dnsPrefetch('https://sentry.io');
}

/**
 * Prefetch route chunks
 * Useful for prefetching lazy-loaded route components
 */
export function prefetchRouteChunk(routePath: string) {
  // This will be populated by Vite's build process
  // The actual implementation depends on the build output
  if (import.meta.env.DEV) {
    console.log(`Prefetching route: ${routePath}`);
  }
}

/**
 * Smart prefetch manager
 * Prefetches resources based on connection speed and user behavior
 */
export class SmartPrefetchManager {
  private prefetchQueue: string[] = [];
  private isPrefetching = false;
  private maxConcurrent = 2;

  constructor() {
    // Check network conditions
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;

      // Adjust strategy based on connection
      if (conn.effectiveType === '4g') {
        this.maxConcurrent = 4;
      } else if (conn.effectiveType === '3g') {
        this.maxConcurrent = 2;
      } else {
        this.maxConcurrent = 1;
      }

      // Don't prefetch on slow connections or save-data mode
      if (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        this.maxConcurrent = 0;
      }
    }
  }

  /**
   * Add URL to prefetch queue
   */
  add(url: string) {
    if (!this.prefetchQueue.includes(url)) {
      this.prefetchQueue.push(url);
      this.processPrefetchQueue();
    }
  }

  /**
   * Process prefetch queue
   */
  private async processPrefetchQueue() {
    if (this.isPrefetching || this.maxConcurrent === 0) return;

    this.isPrefetching = true;

    while (this.prefetchQueue.length > 0) {
      const batch = this.prefetchQueue.splice(0, this.maxConcurrent);
      await Promise.all(batch.map(url => this.prefetchItem(url)));
    }

    this.isPrefetching = false;
  }

  /**
   * Prefetch individual item
   */
  private async prefetchItem(url: string): Promise<void> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Still resolve on error
      document.head.appendChild(link);
    });
  }

  /**
   * Clear prefetch queue
   */
  clear() {
    this.prefetchQueue = [];
  }
}

// Create singleton instance
export const smartPrefetch = new SmartPrefetchManager();

export default prefetchUrl;
