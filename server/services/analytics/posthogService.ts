/**
 * PostHog Analytics Service
 *
 * Provides user analytics, feature flags, and session replay functionality.
 * Free tier: 1M events/month, unlimited users
 *
 * Features:
 * - User event tracking
 * - Feature flags for A/B testing
 * - Session replay
 * - Funnel analysis
 * - Retention tracking
 *
 * Setup:
 * 1. Sign up at https://posthog.com/
 * 2. Get your API key from Project Settings
 * 3. Add to .env: POSTHOG_API_KEY=phc_...
 * 4. Optional: POSTHOG_HOST=https://app.posthog.com (or self-hosted URL)
 *
 * @see https://posthog.com/docs
 */

import { PostHog } from 'posthog-node';

// PostHog client instance
let posthogClient: PostHog | null = null;

/**
 * Initialize PostHog client
 */
export function initPostHog(): PostHog | null {
  // Check if PostHog is enabled
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('⚠️  PostHog API key not configured - analytics disabled');
    console.warn('   Set POSTHOG_API_KEY in .env to enable analytics');
    return null;
  }

  try {
    posthogClient = new PostHog(apiKey, {
      host,
      flushAt: 20, // Flush events after 20 are queued
      flushInterval: 10000, // Flush every 10 seconds
    });

    console.log('✅ PostHog analytics initialized');
    return posthogClient;
  } catch (error) {
    console.error('❌ Failed to initialize PostHog:', error);
    return null;
  }
}

/**
 * Get PostHog client instance
 */
export function getPostHog(): PostHog | null {
  if (!posthogClient) {
    return initPostHog();
  }
  return posthogClient;
}

/**
 * Track user event
 *
 * @param userId - User ID or distinct ID
 * @param event - Event name (e.g., 'car_view', 'search_query', 'chat_message')
 * @param properties - Event properties
 *
 * @example
 * trackEvent('user123', 'car_view', {
 *   car_id: 456,
 *   make: 'Ford',
 *   model: 'Mustang',
 *   year: 1967,
 *   price: 85000
 * });
 */
export function trackEvent(
  userId: string | number,
  event: string,
  properties?: Record<string, any>
): void {
  const client = getPostHog();
  if (!client) return;

  try {
    client.capture({
      distinctId: userId.toString(),
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Identify user with properties
 *
 * @param userId - User ID
 * @param properties - User properties (email, name, plan, etc.)
 *
 * @example
 * identifyUser(123, {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   plan: 'premium',
 *   signupDate: '2025-01-17'
 * });
 */
export function identifyUser(
  userId: string | number,
  properties: Record<string, any>
): void {
  const client = getPostHog();
  if (!client) return;

  try {
    client.identify({
      distinctId: userId.toString(),
      properties: {
        ...properties,
        lastSeen: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Check if feature flag is enabled for user
 *
 * @param userId - User ID
 * @param flagKey - Feature flag key
 * @returns Boolean indicating if flag is enabled
 *
 * @example
 * const showNewUI = await isFeatureEnabled(123, 'new-ui-redesign');
 */
export async function isFeatureEnabled(
  userId: string | number,
  flagKey: string
): Promise<boolean> {
  const client = getPostHog();
  if (!client) return false;

  try {
    const isEnabled = await client.isFeatureEnabled(
      flagKey,
      userId.toString()
    );
    return isEnabled || false;
  } catch (error) {
    console.error('Failed to check feature flag:', error);
    return false;
  }
}

/**
 * Get all feature flags for user
 *
 * @param userId - User ID
 * @returns Object with feature flag key-value pairs
 */
export async function getFeatureFlags(
  userId: string | number
): Promise<Record<string, boolean | string>> {
  const client = getPostHog();
  if (!client) return {};

  try {
    const flags = await client.getAllFlags(userId.toString());
    return flags || {};
  } catch (error) {
    console.error('Failed to get feature flags:', error);
    return {};
  }
}

/**
 * Flush all pending events
 * Call this before shutting down the server
 */
export async function flushEvents(): Promise<void> {
  const client = getPostHog();
  if (!client) return;

  try {
    await client.flush();
    console.log('✅ PostHog events flushed');
  } catch (error) {
    console.error('Failed to flush PostHog events:', error);
  }
}

/**
 * Shutdown PostHog client
 */
export async function shutdownPostHog(): Promise<void> {
  const client = getPostHog();
  if (!client) return;

  try {
    await client.shutdown();
    posthogClient = null;
    console.log('✅ PostHog client shutdown');
  } catch (error) {
    console.error('Failed to shutdown PostHog:', error);
  }
}

// Common event tracking helpers

/**
 * Track page view
 */
export function trackPageView(
  userId: string | number,
  path: string,
  properties?: Record<string, any>
): void {
  trackEvent(userId, '$pageview', {
    $current_url: path,
    ...properties,
  });
}

/**
 * Track car view
 */
export function trackCarView(
  userId: string | number,
  carId: number,
  carData: Record<string, any>
): void {
  trackEvent(userId, 'car_view', {
    car_id: carId,
    ...carData,
  });
}

/**
 * Track search query
 */
export function trackSearch(
  userId: string | number,
  query: string,
  filters: Record<string, any>,
  resultCount: number
): void {
  trackEvent(userId, 'search', {
    query,
    filters,
    result_count: resultCount,
  });
}

/**
 * Track AI chat message
 */
export function trackChatMessage(
  userId: string | number,
  conversationId: string,
  message: string,
  responseTime?: number
): void {
  trackEvent(userId, 'ai_chat_message', {
    conversation_id: conversationId,
    message_length: message.length,
    response_time_ms: responseTime,
  });
}

/**
 * Track bookmark action
 */
export function trackBookmark(
  userId: string | number,
  itemId: number,
  itemType: 'car' | 'event',
  action: 'add' | 'remove'
): void {
  trackEvent(userId, 'bookmark', {
    item_id: itemId,
    item_type: itemType,
    action,
  });
}

/**
 * Track user signup
 */
export function trackSignup(
  userId: string | number,
  method: 'email' | 'google' | 'facebook',
  properties?: Record<string, any>
): void {
  trackEvent(userId, 'signup', {
    method,
    ...properties,
  });
}

/**
 * Track user login
 */
export function trackLogin(
  userId: string | number,
  method: 'email' | 'google' | 'facebook'
): void {
  trackEvent(userId, 'login', {
    method,
  });
}

// Initialize PostHog on module load if API key is present
if (process.env.POSTHOG_API_KEY) {
  initPostHog();
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await shutdownPostHog();
});

process.on('SIGINT', async () => {
  await shutdownPostHog();
});
