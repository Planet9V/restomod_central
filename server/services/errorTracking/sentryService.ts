/**
 * Sentry Error Tracking Service
 *
 * Provides error monitoring, performance tracking, and crash reporting.
 * Free tier: 5K errors/month, 10K performance units/month
 *
 * Features:
 * - Error tracking with stack traces
 * - Performance monitoring
 * - User context and breadcrumbs
 * - Release tracking
 * - Source maps support
 *
 * Setup:
 * 1. Sign up at https://sentry.io/
 * 2. Create a new project
 * 3. Get your DSN from Project Settings
 * 4. Add to .env: SENTRY_DSN=https://...@sentry.io/...
 *
 * @see https://docs.sentry.io/platforms/node/
 */

import * as Sentry from '@sentry/node';
import { Express, Request, Response, NextFunction } from 'express';

/**
 * Initialize Sentry for Node.js backend
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
    console.warn('   Set SENTRY_DSN in .env to enable error tracking');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',

      // Release tracking (use git commit hash)
      release: process.env.GIT_COMMIT || 'development',

      // Sample rate for performance monitoring (0.0 to 1.0)
      // 1.0 = 100% of transactions sent to Sentry
      // For production, you may want to lower this to 0.1 (10%)
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Capture breadcrumbs (console logs, HTTP requests, etc.)
      integrations: [
        // Enable HTTP integration for request tracking
        new Sentry.Integrations.Http({ tracing: true }),

        // Enable Express integration
        new Sentry.Integrations.Express({ app: undefined }),
      ],

      // Don't send errors from these environments
      ignoreErrors: [
        // Browser-related errors that don't affect server
        'Non-Error exception captured',
        'Non-Error promise rejection captured',

        // Network errors
        'Network request failed',
        'NetworkError',

        // Common non-critical errors
        'ResizeObserver loop limit exceeded',
      ],

      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }

        // Remove sensitive query params
        if (event.request?.query_string) {
          const sensitiveParams = ['password', 'token', 'api_key', 'secret'];
          sensitiveParams.forEach(param => {
            if (event.request?.query_string?.includes(param)) {
              event.request.query_string = '[FILTERED]';
            }
          });
        }

        return event;
      },
    });

    console.log('✅ Sentry error tracking initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

/**
 * Setup Sentry middleware for Express app
 * Must be called BEFORE all routes
 */
export function setupSentryMiddleware(app: Express): void {
  if (!process.env.SENTRY_DSN) return;

  // Request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

/**
 * Setup Sentry error handler for Express app
 * Must be called AFTER all routes but BEFORE other error handlers
 */
export function setupSentryErrorHandler(app: Express): void {
  if (!process.env.SENTRY_DSN) return;

  // Error handler must be last
  app.use(Sentry.Handlers.errorHandler());
}

/**
 * Capture exception with context
 *
 * @param error - Error object or message
 * @param context - Additional context (user, tags, extra data)
 *
 * @example
 * captureException(new Error('Payment failed'), {
 *   user: { id: 123, email: 'user@example.com' },
 *   tags: { payment_method: 'stripe' },
 *   extra: { amount: 100, currency: 'USD' }
 * });
 */
export function captureException(
  error: Error | string,
  context?: {
    user?: { id: string | number; email?: string; username?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  }
): string | undefined {
  if (!process.env.SENTRY_DSN) {
    console.error('Error (Sentry disabled):', error);
    return undefined;
  }

  Sentry.withScope((scope) => {
    // Add user context
    if (context?.user) {
      scope.setUser({
        id: context.user.id.toString(),
        email: context.user.email,
        username: context.user.username,
      });
    }

    // Add tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add extra data
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Set severity level
    if (context?.level) {
      scope.setLevel(context.level);
    }

    // Capture exception
    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });

  return Sentry.lastEventId();
}

/**
 * Capture message with context
 *
 * @param message - Message to capture
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    user?: { id: string | number; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): void {
  if (!process.env.SENTRY_DSN) {
    console.log(`[${level.toUpperCase()}]`, message);
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

    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
}

/**
 * Add breadcrumb for debugging
 *
 * @param message - Breadcrumb message
 * @param category - Category (e.g., 'auth', 'database', 'api')
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string = 'default',
  data?: Record<string, any>
): void {
  if (!process.env.SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for current scope
 *
 * @param user - User information
 */
export function setUser(user: {
  id: string | number;
  email?: string;
  username?: string;
  ip?: string;
}): void {
  if (!process.env.SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    ip_address: user.ip,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setUser(null);
}

/**
 * Start a new transaction for performance monitoring
 *
 * @param name - Transaction name
 * @param op - Operation type (e.g., 'http.server', 'db.query')
 * @returns Transaction object
 *
 * @example
 * const transaction = startTransaction('GET /api/cars', 'http.server');
 * try {
 *   // ... your code
 * } finally {
 *   transaction.finish();
 * }
 */
export function startTransaction(name: string, op: string) {
  if (!process.env.SENTRY_DSN) {
    return { finish: () => {}, setStatus: () => {} };
  }

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Express middleware to capture user from request
 */
export function captureUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user) {
    setUser({
      id: (req.user as any).id,
      email: (req.user as any).email,
      username: (req.user as any).username,
      ip: req.ip,
    });
  }
  next();
}

/**
 * Flush all pending events to Sentry
 * Call before shutting down
 */
export async function flushSentry(timeout: number = 2000): Promise<void> {
  if (!process.env.SENTRY_DSN) return;

  try {
    await Sentry.flush(timeout);
    console.log('✅ Sentry events flushed');
  } catch (error) {
    console.error('Failed to flush Sentry events:', error);
  }
}

/**
 * Close Sentry client
 */
export async function closeSentry(): Promise<void> {
  if (!process.env.SENTRY_DSN) return;

  try {
    await Sentry.close(2000);
    console.log('✅ Sentry client closed');
  } catch (error) {
    console.error('Failed to close Sentry:', error);
  }
}

// Initialize Sentry on module load if DSN is present
if (process.env.SENTRY_DSN) {
  initSentry();
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await closeSentry();
});

process.on('SIGINT', async () => {
  await closeSentry();
});
