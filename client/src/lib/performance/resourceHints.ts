/**
 * Resource Hints
 *
 * Utilities for managing resource hints (preconnect, dns-prefetch, preload, prefetch)
 * to optimize resource loading and reduce latency.
 */

/**
 * Resource hint types
 */
export type ResourceHintType = 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch' | 'modulepreload';

/**
 * Preload as types
 */
export type PreloadAsType = 'script' | 'style' | 'font' | 'image' | 'fetch' | 'document' | 'audio' | 'video';

/**
 * Resource hint options
 */
export interface ResourceHintOptions {
  as?: PreloadAsType;
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
  integrity?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Add resource hint to document
 */
export function addResourceHint(
  rel: ResourceHintType,
  href: string,
  options: ResourceHintOptions = {}
): void {
  if (typeof document === 'undefined') return;

  // Check if hint already exists
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.querySelector(selector)) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;

  // Add options
  if (options.as) link.as = options.as;
  if (options.type) link.type = options.type;
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
  if (options.media) link.media = options.media;
  if (options.integrity) link.integrity = options.integrity;

  // Add fetch priority if supported
  if (options.fetchPriority && 'fetchPriority' in HTMLLinkElement.prototype) {
    (link as any).fetchPriority = options.fetchPriority;
  }

  document.head.appendChild(link);
}

/**
 * Preconnect to origin
 *
 * Establishes early connection to important third-party origins
 * to reduce DNS, TCP, and TLS round trips.
 *
 * @param href - Origin URL
 * @param crossOrigin - Whether to include credentials
 */
export function preconnect(href: string, crossOrigin = false): void {
  addResourceHint('preconnect', href, {
    crossOrigin: crossOrigin ? 'anonymous' : undefined,
  });
}

/**
 * DNS prefetch
 *
 * Performs DNS resolution for origins that will be used later.
 * More lightweight than preconnect.
 *
 * @param href - Origin URL
 */
export function dnsPrefetch(href: string): void {
  addResourceHint('dns-prefetch', href);
}

/**
 * Preload resource
 *
 * Fetches resource that will be needed soon with high priority.
 *
 * @param href - Resource URL
 * @param as - Resource type
 * @param options - Additional options
 */
export function preload(
  href: string,
  as: PreloadAsType,
  options: Omit<ResourceHintOptions, 'as'> = {}
): void {
  addResourceHint('preload', href, { ...options, as });
}

/**
 * Prefetch resource
 *
 * Fetches resource that might be needed in future navigation with low priority.
 *
 * @param href - Resource URL
 * @param options - Additional options
 */
export function prefetch(href: string, options: ResourceHintOptions = {}): void {
  addResourceHint('prefetch', href, options);
}

/**
 * Module preload
 *
 * Preloads ES modules with high priority.
 *
 * @param href - Module URL
 * @param options - Additional options
 */
export function modulePreload(href: string, options: ResourceHintOptions = {}): void {
  addResourceHint('modulepreload', href, options);
}

/**
 * Preload critical fonts
 *
 * @param fonts - Array of font URLs
 */
export function preloadFonts(fonts: string[]): void {
  fonts.forEach(font => {
    preload(font, 'font', {
      crossOrigin: 'anonymous',
      type: 'font/woff2',
    });
  });
}

/**
 * Preload critical images
 *
 * @param images - Array of image URLs
 */
export function preloadImages(images: string[]): void {
  images.forEach(image => {
    preload(image, 'image', {
      fetchPriority: 'high',
    });
  });
}

/**
 * Setup critical resource hints
 *
 * Call this early in app initialization to setup
 * connections to critical third-party origins.
 */
export function setupCriticalResourceHints(): void {
  // Preconnect to CDNs
  preconnect('https://res.cloudinary.com', true);

  // Preconnect to analytics
  preconnect('https://app.posthog.com', true);

  // DNS prefetch for other services
  dnsPrefetch('https://sentry.io');
  dnsPrefetch('https://api.openai.com');
  dnsPrefetch('https://api.anthropic.com');

  if (import.meta.env.DEV) {
    console.log('✅ Critical resource hints configured');
  }
}

/**
 * Preload route chunk
 *
 * Preloads JavaScript chunk for a specific route.
 *
 * @param chunkName - Name of the chunk to preload
 */
export function preloadRouteChunk(chunkName: string): void {
  // In production, chunk names will have hashes
  // This is a placeholder - actual implementation depends on build output
  if (import.meta.env.PROD) {
    // Chunk URLs will be available via Vite's manifest
    const chunkUrl = `/assets/js/${chunkName}.js`;
    modulePreload(chunkUrl);
  }
}

/**
 * Remove resource hint
 *
 * @param rel - Hint type
 * @param href - Resource URL
 */
export function removeResourceHint(rel: ResourceHintType, href: string): void {
  if (typeof document === 'undefined') return;

  const selector = `link[rel="${rel}"][href="${href}"]`;
  const link = document.querySelector(selector);

  if (link) {
    link.remove();
  }
}

/**
 * Clear all resource hints of a type
 *
 * @param rel - Hint type to clear
 */
export function clearResourceHints(rel: ResourceHintType): void {
  if (typeof document === 'undefined') return;

  const links = document.querySelectorAll(`link[rel="${rel}"]`);
  links.forEach(link => link.remove());
}

/**
 * Check if resource is already loaded
 *
 * @param href - Resource URL
 * @returns Boolean indicating if resource is loaded
 */
export function isResourceLoaded(href: string): boolean {
  if (typeof performance === 'undefined') return false;

  const entries = performance.getEntriesByName(href);
  return entries.length > 0;
}

/**
 * Adaptive resource loading based on connection
 */
export class AdaptiveResourceLoader {
  private connectionType: string = '4g';
  private saveData: boolean = false;

  constructor() {
    this.detectConnection();
  }

  private detectConnection(): void {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      this.connectionType = conn.effectiveType || '4g';
      this.saveData = conn.saveData || false;

      // Listen for connection changes
      conn.addEventListener('change', () => {
        this.connectionType = conn.effectiveType || '4g';
        this.saveData = conn.saveData || false;
      });
    }
  }

  /**
   * Should preload resources
   */
  shouldPreload(): boolean {
    // Don't preload on slow connections or save-data mode
    if (this.saveData) return false;
    if (this.connectionType === 'slow-2g' || this.connectionType === '2g') return false;
    return true;
  }

  /**
   * Should prefetch resources
   */
  shouldPrefetch(): boolean {
    // Only prefetch on fast connections without save-data
    if (this.saveData) return false;
    if (this.connectionType === '4g') return true;
    return false;
  }

  /**
   * Get fetch priority based on connection
   */
  getFetchPriority(): 'high' | 'low' | 'auto' {
    if (this.connectionType === '4g') return 'high';
    if (this.connectionType === '3g') return 'auto';
    return 'low';
  }

  /**
   * Adaptive preload
   */
  preload(href: string, as: PreloadAsType, options: Omit<ResourceHintOptions, 'as'> = {}): void {
    if (this.shouldPreload()) {
      preload(href, as, {
        ...options,
        fetchPriority: options.fetchPriority || this.getFetchPriority(),
      });
    }
  }

  /**
   * Adaptive prefetch
   */
  prefetch(href: string, options: ResourceHintOptions = {}): void {
    if (this.shouldPrefetch()) {
      prefetch(href, options);
    }
  }
}

// Create singleton instance
export const adaptiveLoader = new AdaptiveResourceLoader();

/**
 * Resource priority manager
 */
export class ResourcePriorityManager {
  private highPriorityResources: Set<string> = new Set();
  private mediumPriorityResources: Set<string> = new Set();
  private lowPriorityResources: Set<string> = new Set();

  /**
   * Add high priority resource
   */
  addHighPriority(href: string, as: PreloadAsType, options: Omit<ResourceHintOptions, 'as'> = {}): void {
    if (!this.highPriorityResources.has(href)) {
      this.highPriorityResources.add(href);
      preload(href, as, { ...options, fetchPriority: 'high' });
    }
  }

  /**
   * Add medium priority resource
   */
  addMediumPriority(href: string, as: PreloadAsType, options: Omit<ResourceHintOptions, 'as'> = {}): void {
    if (!this.mediumPriorityResources.has(href)) {
      this.mediumPriorityResources.add(href);
      preload(href, as, { ...options, fetchPriority: 'auto' });
    }
  }

  /**
   * Add low priority resource
   */
  addLowPriority(href: string, options: ResourceHintOptions = {}): void {
    if (!this.lowPriorityResources.has(href)) {
      this.lowPriorityResources.add(href);
      prefetch(href, { ...options, fetchPriority: 'low' });
    }
  }

  /**
   * Clear all priorities
   */
  clear(): void {
    this.highPriorityResources.clear();
    this.mediumPriorityResources.clear();
    this.lowPriorityResources.clear();
  }
}

export default setupCriticalResourceHints;
