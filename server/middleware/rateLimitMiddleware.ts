/**
 * Rate Limiting Middleware - Phase 2.5
 * SPEC_02_API_ENDPOINTS.md Implementation
 *
 * Comprehensive rate limiting with tier-based strategies:
 * - Anonymous/Free: 100 req/min
 * - Premium: 500 req/min
 * - Admin: 1000 req/min
 * - Search endpoints: 50 req/min
 * - AI chat: 20 req/min
 * - Auth endpoints: 10 req/min
 *
 * Implementation: In-memory Map with sliding window algorithm
 * (Falls back from Redis - not available in dependencies)
 */

import { Request, Response, NextFunction } from 'express';
import { extractUserId } from './authMiddleware';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Rate limit configuration from environment or defaults
 */
const RATE_LIMITS = {
  ANONYMOUS: parseInt(process.env.RATE_LIMIT_ANONYMOUS || '100', 10),
  PREMIUM: parseInt(process.env.RATE_LIMIT_PREMIUM || '500', 10),
  ADMIN: parseInt(process.env.RATE_LIMIT_ADMIN || '1000', 10),
  SEARCH: parseInt(process.env.RATE_LIMIT_SEARCH || '50', 10),
  AI_CHAT: parseInt(process.env.RATE_LIMIT_AI_CHAT || '20', 10),
  AUTH: parseInt(process.env.RATE_LIMIT_AUTH || '10', 10),
} as const;

/**
 * Window duration in milliseconds (1 minute)
 */
const WINDOW_MS = 60 * 1000;

/**
 * Cleanup interval for expired entries (5 minutes)
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rate limit request record with timestamp
 */
interface RateLimitRecord {
  timestamps: number[];
  resetTime: number;
}

/**
 * Rate limit result from check
 */
interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

/**
 * Rate limit info for headers
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * User tier for rate limiting
 */
type UserTier = 'anonymous' | 'premium' | 'admin';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

/**
 * In-memory rate limit store
 * Map<key, RateLimitRecord>
 * Key format: "ratelimit:{userId||ip}:{endpoint}"
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Periodic cleanup of expired entries
 * Runs every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of rateLimitStore.entries()) {
    // Remove entries older than reset time
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
  }
}, CLEANUP_INTERVAL_MS);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get client IP address from request
 * Supports X-Forwarded-For for proxies
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string'
      ? forwarded.split(',')
      : forwarded;
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Generate rate limit key
 * Format: "ratelimit:{userId||ip}:{endpoint}"
 */
export function getRateLimitKey(req: Request, endpoint?: string): string {
  const userId = extractUserId(req);
  const identifier = userId ? `user:${userId}` : `ip:${getClientIp(req)}`;
  const endpointPart = endpoint || req.path;

  return `ratelimit:${identifier}:${endpointPart}`;
}

/**
 * Get user tier based on authentication and role
 */
function getUserTier(req: Request): UserTier {
  if (!req.user) {
    return 'anonymous';
  }

  if (req.user.isAdmin || req.user.isSuperAdmin) {
    return 'admin';
  }

  // Default authenticated users are premium tier
  return 'premium';
}

/**
 * Get rate limit for user tier
 */
function getRateLimitForTier(tier: UserTier): number {
  switch (tier) {
    case 'admin':
      return RATE_LIMITS.ADMIN;
    case 'premium':
      return RATE_LIMITS.PREMIUM;
    case 'anonymous':
    default:
      return RATE_LIMITS.ANONYMOUS;
  }
}

/**
 * Check rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  window: number = WINDOW_MS
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - window;

  // Get or create record
  let record = rateLimitStore.get(key);

  if (!record) {
    record = {
      timestamps: [],
      resetTime: now + window
    };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter(ts => ts > windowStart);

  // Calculate remaining
  const remaining = Math.max(0, limit - record.timestamps.length);
  const allowed = record.timestamps.length < limit;

  // Calculate reset time (end of current window)
  const resetTime = record.timestamps.length > 0
    ? record.timestamps[0] + window
    : now + window;

  // Calculate retry after (seconds until oldest timestamp expires)
  const retryAfter = allowed
    ? 0
    : Math.ceil((record.timestamps[0] + window - now) / 1000);

  return {
    allowed,
    limit,
    remaining,
    resetTime,
    retryAfter
  };
}

/**
 * Increment rate limit counter
 */
export async function incrementCounter(
  key: string,
  window: number = WINDOW_MS
): Promise<void> {
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record) {
    record = {
      timestamps: [],
      resetTime: now + window
    };
    rateLimitStore.set(key, record);
  }

  // Add current timestamp
  record.timestamps.push(now);

  // Update reset time
  record.resetTime = Math.max(record.resetTime, now + window);
}

/**
 * Get rate limit info for headers
 */
export async function getRateLimitInfo(
  key: string,
  limit: number,
  window: number = WINDOW_MS
): Promise<RateLimitInfo> {
  const result = await checkRateLimit(key, limit, window);

  return {
    limit: result.limit,
    remaining: result.remaining,
    resetTime: result.resetTime
  };
}

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(
  res: Response,
  info: RateLimitInfo
): void {
  res.setHeader('X-RateLimit-Limit', info.limit.toString());
  res.setHeader('X-RateLimit-Remaining', info.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.floor(info.resetTime / 1000).toString());
}

/**
 * Send rate limit exceeded response
 */
function sendRateLimitError(
  res: Response,
  retryAfter: number
): void {
  res.setHeader('Retry-After', retryAfter.toString());

  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter
    }
  });
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Global Rate Limiter
 *
 * Applies tier-based rate limits:
 * - Anonymous: 100 req/min
 * - Premium (authenticated): 500 req/min
 * - Admin: 1000 req/min
 *
 * Tracks by user ID (if authenticated) or IP address
 */
export async function globalRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Determine user tier and limit
    const tier = getUserTier(req);
    const limit = getRateLimitForTier(tier);

    // Generate key (global endpoint)
    const key = getRateLimitKey(req, 'global');

    // Check rate limit
    const result = await checkRateLimit(key, limit);

    // Set headers
    setRateLimitHeaders(res, {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    });

    // Check if allowed
    if (!result.allowed) {
      sendRateLimitError(res, result.retryAfter);
      return;
    }

    // Increment counter
    await incrementCounter(key);

    next();
  } catch (error) {
    console.error('[RateLimit] Global rate limit error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
}

/**
 * Endpoint-Specific Rate Limiter
 *
 * Creates a configurable rate limiter for specific endpoints
 *
 * @param limit - Maximum requests allowed
 * @param window - Time window in milliseconds (default: 60000ms = 1 minute)
 * @param endpoint - Optional endpoint identifier (default: req.path)
 *
 * @example
 * router.post('/api/data', endpointRateLimit(50, 60000), handler);
 */
export function endpointRateLimit(
  limit: number,
  window: number = WINDOW_MS,
  endpoint?: string
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate key
      const key = getRateLimitKey(req, endpoint);

      // Check rate limit
      const result = await checkRateLimit(key, limit, window);

      // Set headers
      setRateLimitHeaders(res, {
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime
      });

      // Check if allowed
      if (!result.allowed) {
        sendRateLimitError(res, result.retryAfter);
        return;
      }

      // Increment counter
      await incrementCounter(key, window);

      next();
    } catch (error) {
      console.error('[RateLimit] Endpoint rate limit error:', error);
      // On error, allow request to proceed (fail open)
      next();
    }
  };
}

/**
 * Auth Endpoint Rate Limiter
 *
 * Strict rate limiting for authentication endpoints
 * - Limit: 10 requests per minute
 * - Tracks by IP address (not user, since they're logging in)
 * - Prevents brute force attacks
 *
 * Use on: /api/auth/login, /api/auth/register, /api/auth/forgot-password
 */
export async function authRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = RATE_LIMITS.AUTH;

    // Always track by IP for auth endpoints
    const ip = getClientIp(req);
    const key = `ratelimit:ip:${ip}:auth`;

    // Check rate limit
    const result = await checkRateLimit(key, limit);

    // Set headers
    setRateLimitHeaders(res, {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    });

    // Check if allowed
    if (!result.allowed) {
      console.warn(`[RateLimit] Auth rate limit exceeded for IP: ${ip}`);
      sendRateLimitError(res, result.retryAfter);
      return;
    }

    // Increment counter
    await incrementCounter(key);

    next();
  } catch (error) {
    console.error('[RateLimit] Auth rate limit error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
}

/**
 * Search Endpoint Rate Limiter
 *
 * Moderate rate limiting for search endpoints
 * - Limit: 50 requests per minute
 * - Tracks by user ID or IP address
 * - Prevents search abuse
 *
 * Use on: /api/cars, /api/events, /api/search/*
 */
export async function searchRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = RATE_LIMITS.SEARCH;

    // Generate key for search
    const key = getRateLimitKey(req, 'search');

    // Check rate limit
    const result = await checkRateLimit(key, limit);

    // Set headers
    setRateLimitHeaders(res, {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    });

    // Check if allowed
    if (!result.allowed) {
      sendRateLimitError(res, result.retryAfter);
      return;
    }

    // Increment counter
    await incrementCounter(key);

    next();
  } catch (error) {
    console.error('[RateLimit] Search rate limit error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
}

/**
 * AI Chat Rate Limiter
 *
 * Most restrictive rate limiting due to AI costs
 * - Limit: 20 requests per minute
 * - Tracks by user ID or IP address
 * - Prevents abuse of expensive AI endpoints
 *
 * Use on: /api/ai/chat, /api/ai/*
 */
export async function chatRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = RATE_LIMITS.AI_CHAT;

    // Generate key for AI chat
    const key = getRateLimitKey(req, 'ai-chat');

    // Check rate limit
    const result = await checkRateLimit(key, limit);

    // Set headers
    setRateLimitHeaders(res, {
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.resetTime
    });

    // Check if allowed
    if (!result.allowed) {
      console.warn(`[RateLimit] AI chat rate limit exceeded for key: ${key}`);
      sendRateLimitError(res, result.retryAfter);
      return;
    }

    // Increment counter
    await incrementCounter(key);

    next();
  } catch (error) {
    console.error('[RateLimit] Chat rate limit error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get current rate limit statistics (for monitoring/debugging)
 */
export function getRateLimitStats(): {
  totalKeys: number;
  memoryUsage: number;
} {
  return {
    totalKeys: rateLimitStore.size,
    memoryUsage: process.memoryUsage().heapUsed
  };
}

/**
 * Clear all rate limit data (for testing only)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
  console.log('[RateLimit] All rate limit data cleared');
}

/**
 * Clear rate limit for specific key (admin override)
 */
export function clearRateLimitForKey(key: string): boolean {
  return rateLimitStore.delete(key);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Middleware functions
  globalRateLimit,
  endpointRateLimit,
  authRateLimit,
  searchRateLimit,
  chatRateLimit,

  // Helper functions
  getRateLimitKey,
  checkRateLimit,
  incrementCounter,
  getRateLimitInfo,

  // Utility functions
  getRateLimitStats,
  clearRateLimits,
  clearRateLimitForKey,

  // Constants
  RATE_LIMITS,
  WINDOW_MS
};
