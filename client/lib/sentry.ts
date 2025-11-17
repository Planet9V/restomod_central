/**
 * Sentry Error Tracking - Client Side
 *
 * Provides error monitoring and performance tracking on the frontend.
 *
 * Features:
 * - Automatic error capture
 * - Performance monitoring
 * - User feedback
 * - Session replay
 * - Breadcrumbs
 *
 * Usage:
 * Import and initialize in your app's entry point
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE || 'development';

/**
 * Initialize Sentry for React
 * Call this once in your app's entry point (main.tsx)
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Release tracking
    release: import.meta.env.VITE_GIT_COMMIT || 'development',

    // Sample rate for performance monitoring (0.0 to 1.0)
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay sample rate
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    integrations: [
      // React Router integration (if using React Router)
      new Sentry.BrowserTracing(),

      // Session Replay integration
      new Sentry.Replay({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block images/videos for privacy
      }),
    ],

    // Don't send errors from these environments
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Random plugins/extensions
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',

      // Network errors
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // Common non-errors
      'Non-Error promise rejection captured',
      'Non-Error exception captured',
    ],

    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send errors in development
      if (ENVIRONMENT === 'development') {
        console.error('Sentry would send:', event, hint);
        return null; // Don't actually send in dev
      }

      // Remove sensitive data from request
      if (event.request) {
        // Remove auth headers
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.Cookie;
        }

        // Remove sensitive query params
        if (event.request.query_string) {
          const sensitiveParams = ['password', 'token', 'api_key', 'secret'];
          sensitiveParams.forEach(param => {
            if (event.request?.query_string?.includes(param)) {
              event.request.query_string = '[FILTERED]';
            }
          });
        }
      }

      // Remove localStorage/sessionStorage data that might be sensitive
      if (event.contexts?.localStorage) {
        delete event.contexts.localStorage;
      }
      if (event.contexts?.sessionStorage) {
        delete event.contexts.sessionStorage;
      }

      return event;
    },
  });

  console.log('✅ Sentry error tracking initialized');
}

/**
 * Capture exception manually
 *
 * @param error - Error object or message
 * @param context - Additional context
 */
export function captureException(
  error: Error | string,
  context?: {
    user?: { id: string | number; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
): void {
  if (!SENTRY_DSN) {
    console.error('Error (Sentry disabled):', error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser({
        id: context.user.id.toString(),
        email: context.user.email,
      });
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Set user context
 *
 * @param user - User information
 */
export function setUser(user: {
  id: string | number;
  email?: string;
  username?: string;
}): void {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 *
 * @param message - Breadcrumb message
 * @param category - Category
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string = 'default',
  data?: Record<string, any>
): void {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Show user feedback dialog
 * Allows users to submit feedback when an error occurs
 */
export function showFeedbackDialog(): void {
  if (!SENTRY_DSN) return;

  const eventId = Sentry.lastEventId();
  if (eventId) {
    Sentry.showReportDialog({ eventId });
  }
}

/**
 * React Error Boundary component
 * Wrap your app with this to catch React errors
 *
 * Usage:
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </ErrorBoundary>
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Sentry profiler for performance monitoring
 * Wrap performance-critical components
 *
 * Usage:
 * <Profiler name="UserDashboard">
 *   <UserDashboard />
 * </Profiler>
 */
export const Profiler = Sentry.Profiler;

export default Sentry;
