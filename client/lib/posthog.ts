/**
 * PostHog Analytics - Client Side
 *
 * Provides user analytics, feature flags, and session replay on the frontend.
 *
 * Features:
 * - Automatic pageview tracking
 * - User identification
 * - Feature flags
 * - Session replay
 * - Heatmaps
 *
 * Usage in React components:
 * import { usePostHog } from './lib/posthog';
 *
 * function MyComponent() {
 *   const posthog = usePostHog();
 *   posthog.capture('button_clicked', { button: 'cta' });
 * }
 */

import posthog from 'posthog-js';
import { useEffect } from 'react';

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Initialize PostHog
 * Call this once in your app's entry point
 */
export function initPostHog(): void {
  if (!POSTHOG_KEY) {
    console.warn('PostHog API key not configured - analytics disabled');
    return;
  }

  if (typeof window === 'undefined') {
    // Don't initialize on server-side
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // Enable session replay (FREE on cloud, requires self-hosting for privacy)
    session_recording: {
      // Mask all text content by default for privacy
      maskAllInputs: true,
      maskTextSelector: '*',
    },

    // Capture pageviews automatically
    capture_pageview: true,

    // Capture performance metrics
    capture_performance: true,

    // Enable feature flags
    autocapture: true,

    // Privacy settings
    persistence: 'localStorage', // Use localStorage for persistence

    // Respect Do Not Track
    respect_dnt: true,

    // Loaded callback
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log('✅ PostHog analytics loaded');
      }
    },
  });
}

/**
 * Get PostHog instance
 */
export function getPostHog() {
  return posthog;
}

/**
 * Identify user
 * Call this after user logs in
 *
 * @param userId - User ID
 * @param properties - User properties
 */
export function identifyUser(
  userId: string | number,
  properties?: {
    email?: string;
    name?: string;
    plan?: string;
    createdAt?: string;
    [key: string]: any;
  }
): void {
  if (!POSTHOG_KEY) return;

  posthog.identify(userId.toString(), properties);
}

/**
 * Reset user identity
 * Call this when user logs out
 */
export function resetUser(): void {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

/**
 * Track custom event
 *
 * @param event - Event name
 * @param properties - Event properties
 */
export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

/**
 * Check if feature flag is enabled
 *
 * @param flagKey - Feature flag key
 * @returns Boolean or undefined if not loaded yet
 */
export function isFeatureEnabled(flagKey: string): boolean | undefined {
  if (!POSTHOG_KEY) return false;
  return posthog.isFeatureEnabled(flagKey);
}

/**
 * React hook for PostHog
 */
export function usePostHog() {
  useEffect(() => {
    // Initialize PostHog if not already initialized
    if (!posthog.__loaded) {
      initPostHog();
    }
  }, []);

  return posthog;
}

/**
 * React hook for feature flags
 *
 * @param flagKey - Feature flag key
 * @returns Boolean indicating if flag is enabled
 */
export function useFeatureFlag(flagKey: string): boolean {
  useEffect(() => {
    if (!posthog.__loaded) {
      initPostHog();
    }
  }, []);

  return isFeatureEnabled(flagKey) ?? false;
}

// Common event tracking helpers

export const analytics = {
  /**
   * Track page view
   */
  pageView: (path: string, properties?: Record<string, any>) => {
    trackEvent('$pageview', { $current_url: path, ...properties });
  },

  /**
   * Track car view
   */
  carView: (carId: number, carData: Record<string, any>) => {
    trackEvent('car_view', { car_id: carId, ...carData });
  },

  /**
   * Track search
   */
  search: (query: string, filters: Record<string, any>, resultCount: number) => {
    trackEvent('search', { query, filters, result_count: resultCount });
  },

  /**
   * Track AI chat
   */
  chatMessage: (conversationId: string, messageLength: number) => {
    trackEvent('ai_chat_message', { conversation_id: conversationId, message_length: messageLength });
  },

  /**
   * Track bookmark
   */
  bookmark: (itemId: number, itemType: 'car' | 'event', action: 'add' | 'remove') => {
    trackEvent('bookmark', { item_id: itemId, item_type: itemType, action });
  },

  /**
   * Track signup
   */
  signup: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('signup', { method });
  },

  /**
   * Track login
   */
  login: (method: 'email' | 'google' | 'facebook') => {
    trackEvent('login', { method });
  },

  /**
   * Track logout
   */
  logout: () => {
    trackEvent('logout');
    resetUser();
  },
};

export default posthog;
