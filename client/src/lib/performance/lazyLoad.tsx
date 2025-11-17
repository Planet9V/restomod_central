/**
 * Lazy Loading Utilities
 *
 * Provides utilities for lazy loading images, components, and other resources
 * using IntersectionObserver for optimal performance.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Options for lazy loading
 */
export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

/**
 * Hook to lazy load images
 *
 * @param options - Lazy load options
 * @returns [ref, isIntersecting]
 *
 * @example
 * ```tsx
 * const [ref, isVisible] = useLazyLoad();
 * return <img ref={ref} src={isVisible ? actualSrc : placeholder} />;
 * ```
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: LazyLoadOptions = {}
): [React.RefObject<T>, boolean] {
  const {
    rootMargin = '50px',
    threshold = 0.01,
    triggerOnce = true,
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce]);

  return [ref, isIntersecting];
}

/**
 * Hook for lazy loading with callback
 *
 * @param callback - Function to call when element becomes visible
 * @param options - Lazy load options
 *
 * @example
 * ```tsx
 * const ref = useLazyLoadCallback(() => {
 *   console.log('Element is visible!');
 * });
 * return <div ref={ref}>Content</div>;
 * ```
 */
export function useLazyLoadCallback<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: LazyLoadOptions = {}
): React.RefObject<T> {
  const {
    rootMargin = '50px',
    threshold = 0.01,
    triggerOnce = true,
  } = options;

  const ref = useRef<T>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered.current)) {
          hasTriggered.current = true;
          callback();
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, rootMargin, threshold, triggerOnce]);

  return ref;
}

/**
 * Lazy load image component
 *
 * @example
 * ```tsx
 * <LazyImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   placeholder="/path/to/placeholder.jpg"
 * />
 * ```
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  className = '',
  onLoad,
  ...props
}: LazyImageProps) {
  const [ref, isVisible] = useLazyLoad<HTMLImageElement>();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Use blur placeholder if provided
  const placeholderSrc = blurDataURL || placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

  return (
    <img
      ref={ref}
      src={isVisible ? src : placeholderSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      {...props}
    />
  );
}

/**
 * Preload image
 *
 * @param src - Image source URL
 * @returns Promise that resolves when image is loaded
 *
 * @example
 * ```tsx
 * await preloadImage('/path/to/image.jpg');
 * ```
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 *
 * @param srcs - Array of image source URLs
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * Lazy load background image
 *
 * @example
 * ```tsx
 * const ref = useLazyBackgroundImage('/path/to/image.jpg');
 * return <div ref={ref}>Content</div>;
 * ```
 */
export function useLazyBackgroundImage<T extends HTMLElement = HTMLDivElement>(
  src: string,
  options: LazyLoadOptions = {}
): React.RefObject<T> {
  const ref = useRef<T>(null);

  const callback = () => {
    if (ref.current) {
      ref.current.style.backgroundImage = `url(${src})`;
    }
  };

  useLazyLoadCallback(callback, options);

  return ref;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Observe elements for lazy loading
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver | null = null;
  private elements: Set<HTMLElement> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            this.loadElement(element);
            this.observer?.unobserve(element);
            this.elements.delete(element);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.01,
        ...options,
      });
    }
  }

  observe(element: HTMLElement) {
    if (this.observer) {
      this.observer.observe(element);
      this.elements.add(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadElement(element);
    }
  }

  unobserve(element: HTMLElement) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }

  private loadElement(element: HTMLElement) {
    // Load image from data-src attribute
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.src;
      if (src) {
        element.src = src;
        element.removeAttribute('data-src');
      }
    }

    // Load background image from data-bg attribute
    const bgSrc = element.dataset.bg;
    if (bgSrc) {
      element.style.backgroundImage = `url(${bgSrc})`;
      element.removeAttribute('data-bg');
    }

    // Add loaded class
    element.classList.add('lazy-loaded');
  }
}

export default useLazyLoad;
