/**
 * Rate Limiting Middleware - Usage Examples
 *
 * This file demonstrates how to use the rate limiting middleware
 * across different endpoint types in your Express application.
 */

import express, { Router } from 'express';
import {
  globalRateLimit,
  endpointRateLimit,
  authRateLimit,
  searchRateLimit,
  chatRateLimit,
} from './rateLimitMiddleware';
import { requireAuth, requireAdmin, optionalAuth } from './authMiddleware';

const router: Router = express.Router();

// ============================================================================
// EXAMPLE 1: Global Rate Limiting
// ============================================================================
// Apply to all routes - use in main app.ts/index.ts

/**
 * Apply global rate limit to entire API
 *
 * app.use('/api', globalRateLimit);
 *
 * This applies tier-based limits:
 * - Anonymous: 100 req/min
 * - Premium (authenticated): 500 req/min
 * - Admin: 1000 req/min
 */

// ============================================================================
// EXAMPLE 2: Authentication Endpoints
// ============================================================================
// Strict rate limiting to prevent brute force attacks

router.post('/api/auth/login', authRateLimit, async (req, res) => {
  // Login handler
  // Rate limited to 10 requests/minute per IP
  res.json({ success: true });
});

router.post('/api/auth/register', authRateLimit, async (req, res) => {
  // Registration handler
  // Rate limited to 10 requests/minute per IP
  res.json({ success: true });
});

router.post('/api/auth/forgot-password', authRateLimit, async (req, res) => {
  // Forgot password handler
  // Rate limited to 10 requests/minute per IP
  res.json({ success: true });
});

router.post('/api/auth/reset-password', authRateLimit, async (req, res) => {
  // Reset password handler
  // Rate limited to 10 requests/minute per IP
  res.json({ success: true });
});

// ============================================================================
// EXAMPLE 3: Search Endpoints
// ============================================================================
// Moderate rate limiting for search operations

router.get('/api/cars', searchRateLimit, optionalAuth, async (req, res) => {
  // Car search handler
  // Rate limited to 50 requests/minute
  res.json({ success: true, data: { cars: [] } });
});

router.get('/api/events', searchRateLimit, optionalAuth, async (req, res) => {
  // Event search handler
  // Rate limited to 50 requests/minute
  res.json({ success: true, data: { events: [] } });
});

router.post('/api/search/vector', searchRateLimit, requireAuth, async (req, res) => {
  // Vector search handler
  // Rate limited to 50 requests/minute
  res.json({ success: true, data: { results: [] } });
});

// ============================================================================
// EXAMPLE 4: AI Chat Endpoints
// ============================================================================
// Most restrictive rate limiting due to AI costs

router.post('/api/ai/chat', chatRateLimit, requireAuth, async (req, res) => {
  // AI chat handler
  // Rate limited to 20 requests/minute
  res.json({ success: true });
});

router.get('/api/ai/conversations', chatRateLimit, requireAuth, async (req, res) => {
  // Chat history handler
  // Rate limited to 20 requests/minute
  res.json({ success: true, data: { conversations: [] } });
});

router.post('/api/ai/embed', chatRateLimit, requireAdmin, async (req, res) => {
  // Embedding generation handler
  // Rate limited to 20 requests/minute
  res.json({ success: true });
});

// ============================================================================
// EXAMPLE 5: Custom Endpoint Rate Limiting
// ============================================================================
// Flexible rate limiting for specific endpoints

router.post(
  '/api/admin/scrapers/:id/run',
  endpointRateLimit(5, 60000), // 5 requests per minute
  requireAdmin,
  async (req, res) => {
    // Scraper trigger handler
    // Custom rate limit: 5 requests/minute
    res.json({ success: true });
  }
);

router.post(
  '/api/bookmarks',
  endpointRateLimit(30, 60000), // 30 requests per minute
  requireAuth,
  async (req, res) => {
    // Bookmark creation handler
    // Custom rate limit: 30 requests/minute
    res.json({ success: true });
  }
);

router.get(
  '/api/cars/:id',
  endpointRateLimit(100, 60000), // 100 requests per minute
  optionalAuth,
  async (req, res) => {
    // Car detail handler
    // Custom rate limit: 100 requests/minute
    res.json({ success: true });
  }
);

// ============================================================================
// EXAMPLE 6: Combining Multiple Middleware
// ============================================================================
// Stack rate limiting with authentication and other middleware

router.post(
  '/api/admin/users',
  globalRateLimit, // Global tier-based limit
  requireAuth, // Must be authenticated
  requireAdmin, // Must be admin
  async (req, res) => {
    // Create user handler
    res.json({ success: true });
  }
);

router.get(
  '/api/admin/analytics/dashboard',
  endpointRateLimit(20, 60000), // Custom limit for analytics
  requireAuth,
  requireAdmin,
  async (req, res) => {
    // Analytics dashboard handler
    res.json({ success: true });
  }
);

// ============================================================================
// EXAMPLE 7: Different Windows
// ============================================================================
// Using different time windows for rate limits

router.post(
  '/api/bulk-import',
  endpointRateLimit(10, 3600000), // 10 requests per hour (3600000ms)
  requireAdmin,
  async (req, res) => {
    // Bulk import handler
    // Rate limited to 10 requests/hour
    res.json({ success: true });
  }
);

router.post(
  '/api/quick-action',
  endpointRateLimit(200, 60000), // 200 requests per minute
  requireAuth,
  async (req, res) => {
    // Quick action handler
    // Rate limited to 200 requests/minute
    res.json({ success: true });
  }
);

// ============================================================================
// EXAMPLE 8: Public vs Authenticated Endpoints
// ============================================================================
// Different rate limits based on authentication

// Public endpoint - uses global rate limiting (100/min for anonymous)
router.get('/api/public/stats', globalRateLimit, async (req, res) => {
  res.json({ success: true, data: { stats: {} } });
});

// Authenticated endpoint - uses global rate limiting (500/min for premium)
router.get('/api/user/profile', globalRateLimit, requireAuth, async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// ============================================================================
// EXAMPLE 9: Express App Integration
// ============================================================================

/**
 * Full Express app setup with rate limiting
 */
/*
import express from 'express';
import { globalRateLimit } from './middleware/rateLimitMiddleware';
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import aiRoutes from './routes/ai';

const app = express();

// Middleware
app.use(express.json());

// Global rate limiting (optional - can be applied to specific routes instead)
app.use('/api', globalRateLimit);

// Routes (with their own specific rate limits)
app.use('/api/auth', authRoutes);    // Uses authRateLimit
app.use('/api/cars', carRoutes);     // Uses searchRateLimit
app.use('/api/ai', aiRoutes);        // Uses chatRateLimit

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
*/

// ============================================================================
// EXAMPLE 10: Testing Rate Limits
// ============================================================================

/**
 * Test endpoint to verify rate limiting works
 */
router.get('/api/test/rate-limit', endpointRateLimit(5, 60000), async (req, res) => {
  // This endpoint allows only 5 requests per minute
  // Try making 6 requests quickly to see rate limiting in action

  res.json({
    success: true,
    message: 'Rate limit test endpoint',
    headers: {
      limit: res.getHeader('X-RateLimit-Limit'),
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset')
    }
  });
});

// ============================================================================
// EXAMPLE 11: Admin Override
// ============================================================================

/**
 * Admin endpoint to clear rate limits (emergency use)
 */
router.post(
  '/api/admin/rate-limit/clear/:key',
  requireAdmin,
  async (req, res) => {
    const { clearRateLimitForKey } = await import('./rateLimitMiddleware');
    const { key } = req.params;

    const cleared = clearRateLimitForKey(key);

    res.json({
      success: true,
      message: cleared ? 'Rate limit cleared' : 'Key not found',
      key
    });
  }
);

/**
 * Admin endpoint to view rate limit statistics
 */
router.get(
  '/api/admin/rate-limit/stats',
  requireAdmin,
  async (req, res) => {
    const { getRateLimitStats } = await import('./rateLimitMiddleware');
    const stats = getRateLimitStats();

    res.json({
      success: true,
      data: stats
    });
  }
);

export default router;
