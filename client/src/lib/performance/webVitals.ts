/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals (LCP, FID, CLS) and other performance metrics.
 * Integrates with PostHog for analytics.
 *
 * Core Web Vitals Targets:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FCP (First Contentful Paint): < 1.8s
 * - TTFB (Time to First Byte): < 600ms
 */

import { getPostHog } from '@/../lib/posthog';

interface WebVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  inp?: number;
}

/**
 * Get rating for a metric based on thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 600, poor: 1500 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report web vital to analytics
 */
function reportWebVital(metric: WebVitalMetric) {
  const posthog = getPostHog();

  // Send to PostHog
  posthog.capture('web_vital', {
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: `${metric.value}ms`,
      rating: metric.rating,
    });
  }

  // Warn if poor performance
  if (metric.rating === 'poor') {
    console.warn(`⚠️ Poor ${metric.name}: ${metric.value}ms (threshold: ${metric.name === 'LCP' ? '2.5s' : metric.name === 'FID' ? '100ms' : '0.1'})`);
  }
}

/**
 * Measure LCP (Largest Contentful Paint)
 */
function measureLCP(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };

      const value = lastEntry.renderTime || lastEntry.loadTime || 0;
      const metric: WebVitalMetric = {
        name: 'LCP',
        value,
        delta: value,
        id: `v3-${Date.now()}-${Math.random()}`,
        rating: getRating('LCP', value),
      };

      callback(metric);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.error('Error measuring LCP:', e);
  }
}

/**
 * Measure FID (First Input Delay)
 */
function measureFID(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming;

      const value = firstEntry.processingStart - firstEntry.startTime;
      const metric: WebVitalMetric = {
        name: 'FID',
        value,
        delta: value,
        id: `v3-${Date.now()}-${Math.random()}`,
        rating: getRating('FID', value),
      };

      callback(metric);
      observer.disconnect();
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.error('Error measuring FID:', e);
  }
}

/**
 * Measure CLS (Cumulative Layout Shift)
 */
function measureCLS(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          if (
            clsEntries.length === 0 ||
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          } else {
            clsEntries = [entry];
            clsValue = (entry as any).value;
          }
        }
      }

      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        delta: clsValue,
        id: `v3-${Date.now()}-${Math.random()}`,
        rating: getRating('CLS', clsValue),
      };

      callback(metric);
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report final CLS on page hide
    const reportFinalCLS = () => {
      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        delta: clsValue,
        id: `v3-${Date.now()}-${Math.random()}`,
        rating: getRating('CLS', clsValue),
      };
      callback(metric);
    };

    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportFinalCLS();
      }
    });
  } catch (e) {
    console.error('Error measuring CLS:', e);
  }
}

/**
 * Measure FCP (First Contentful Paint)
 */
function measureFCP(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');

      if (fcpEntry) {
        const value = fcpEntry.startTime;
        const metric: WebVitalMetric = {
          name: 'FCP',
          value,
          delta: value,
          id: `v3-${Date.now()}-${Math.random()}`,
          rating: getRating('FCP', value),
        };

        callback(metric);
        observer.disconnect();
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.error('Error measuring FCP:', e);
  }
}

/**
 * Measure TTFB (Time to First Byte)
 */
function measureTTFB(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined') return;

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      const value = navigationEntry.responseStart - navigationEntry.requestStart;
      const metric: WebVitalMetric = {
        name: 'TTFB',
        value,
        delta: value,
        id: `v3-${Date.now()}-${Math.random()}`,
        rating: getRating('TTFB', value),
      };

      callback(metric);
    }
  } catch (e) {
    console.error('Error measuring TTFB:', e);
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // Measure all core web vitals
  measureLCP(reportWebVital);
  measureFID(reportWebVital);
  measureCLS(reportWebVital);
  measureFCP(reportWebVital);
  measureTTFB(reportWebVital);

  // Log initialization
  if (import.meta.env.DEV) {
    console.log('✅ Web Vitals monitoring initialized');
  }
}

/**
 * Get all performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined') return {};

  const metrics: PerformanceMetrics = {};

  // Get navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    metrics.ttfb = navigation.responseStart - navigation.requestStart;
  }

  // Get paint timing
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
  }

  return metrics;
}

/**
 * Report custom performance mark
 */
export function reportPerformanceMark(name: string, startMark?: string) {
  if (typeof window === 'undefined') return;

  try {
    if (startMark && performance.getEntriesByName(startMark).length > 0) {
      performance.measure(name, startMark);
      const measure = performance.getEntriesByName(name)[0];

      const posthog = getPostHog();
      posthog.capture('performance_mark', {
        name,
        duration: measure.duration,
      });

      if (import.meta.env.DEV) {
        console.log(`[Performance Mark] ${name}: ${measure.duration}ms`);
      }
    } else {
      performance.mark(name);
    }
  } catch (e) {
    console.error('Error reporting performance mark:', e);
  }
}

export default initWebVitals;
