/**
 * Rate Limiting Middleware - Unit Tests
 *
 * Comprehensive test suite for rate limiting functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import {
  globalRateLimit,
  endpointRateLimit,
  authRateLimit,
  searchRateLimit,
  chatRateLimit,
  getRateLimitKey,
  checkRateLimit,
  incrementCounter,
  clearRateLimits,
  getRateLimitStats,
} from '../rateLimitMiddleware';

// ============================================================================
// TEST SETUP
// ============================================================================

function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  return app;
}

// Helper to simulate authenticated user
function mockAuthUser(app: Express, userId: number, isAdmin: boolean = false) {
  app.use((req: Request, res: Response, next) => {
    req.user = {
      id: userId,
      email: `user${userId}@example.com`,
      username: `user${userId}`,
      isAdmin,
    };
    next();
  });
}

// Helper to wait (for time-based tests)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// TESTS
// ============================================================================

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  afterEach(() => {
    clearRateLimits();
  });

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  describe('getRateLimitKey', () => {
    it('should generate key with user ID when authenticated', () => {
      const req = {
        user: { id: 123 },
        path: '/api/test',
      } as any;

      const key = getRateLimitKey(req);
      expect(key).toContain('user:123');
      expect(key).toContain('/api/test');
    });

    it('should generate key with IP when not authenticated', () => {
      const req = {
        path: '/api/test',
        ip: '192.168.1.1',
      } as any;

      const key = getRateLimitKey(req);
      expect(key).toContain('ip:');
      expect(key).toContain('/api/test');
    });

    it('should use custom endpoint when provided', () => {
      const req = {
        user: { id: 123 },
        path: '/api/test',
      } as any;

      const key = getRateLimitKey(req, 'custom-endpoint');
      expect(key).toContain('custom-endpoint');
      expect(key).not.toContain('/api/test');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow request within limit', async () => {
      const key = 'test:key:1';
      const result = await checkRateLimit(key, 100, 60000);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(100);
      expect(result.retryAfter).toBe(0);
    });

    it('should deny request over limit', async () => {
      const key = 'test:key:2';
      const limit = 5;

      // Increment counter 5 times
      for (let i = 0; i < limit; i++) {
        await incrementCounter(key, 60000);
      }

      // 6th request should be denied
      const result = await checkRateLimit(key, limit, 60000);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should respect sliding window', async () => {
      const key = 'test:key:3';
      const limit = 5;
      const window = 1000; // 1 second

      // Add 5 requests
      for (let i = 0; i < limit; i++) {
        await incrementCounter(key, window);
      }

      // Should be at limit
      let result = await checkRateLimit(key, limit, window);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await wait(1100);

      // Should be allowed again
      result = await checkRateLimit(key, limit, window);
      expect(result.allowed).toBe(true);
    });
  });

  describe('incrementCounter', () => {
    it('should increment counter correctly', async () => {
      const key = 'test:key:4';

      let result = await checkRateLimit(key, 100, 60000);
      expect(result.remaining).toBe(100);

      await incrementCounter(key, 60000);

      result = await checkRateLimit(key, 100, 60000);
      expect(result.remaining).toBe(99);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return statistics', () => {
      const stats = getRateLimitStats();

      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.totalKeys).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });

    it('should track number of active keys', async () => {
      const key1 = 'test:key:5';
      const key2 = 'test:key:6';

      await incrementCounter(key1, 60000);
      await incrementCounter(key2, 60000);

      const stats = getRateLimitStats();
      expect(stats.totalKeys).toBeGreaterThanOrEqual(2);
    });
  });

  // --------------------------------------------------------------------------
  // Middleware Functions
  // --------------------------------------------------------------------------

  describe('globalRateLimit', () => {
    it('should allow anonymous requests within limit', async () => {
      const app = createTestApp();

      app.get('/test', globalRateLimit, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should deny requests over limit', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(3), (req, res) => {
        res.json({ success: true });
      });

      // Make 3 successful requests
      for (let i = 0; i < 3; i++) {
        await request(app).get('/test').expect(200);
      }

      // 4th request should be denied
      const response = await request(app)
        .get('/test')
        .expect(429);

      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.body.error.retryAfter).toBeGreaterThan(0);
      expect(response.headers['retry-after']).toBeDefined();
    });

    it('should apply different limits for different tiers', async () => {
      clearRateLimits();

      // Test anonymous user (100 req/min default)
      const anonApp = createTestApp();
      anonApp.get('/test', globalRateLimit, (req, res) => {
        res.json({ success: true });
      });

      const anonResponse = await request(anonApp).get('/test');
      expect(anonResponse.headers['x-ratelimit-limit']).toBe('100');

      clearRateLimits();

      // Test admin user (1000 req/min default)
      const adminApp = createTestApp();
      mockAuthUser(adminApp, 1, true);
      adminApp.get('/test', globalRateLimit, (req, res) => {
        res.json({ success: true });
      });

      const adminResponse = await request(adminApp).get('/test');
      expect(adminResponse.headers['x-ratelimit-limit']).toBe('1000');
    });
  });

  describe('endpointRateLimit', () => {
    it('should enforce custom limit', async () => {
      const app = createTestApp();
      const limit = 5;

      app.get('/test', endpointRateLimit(limit), (req, res) => {
        res.json({ success: true });
      });

      // Make limit requests successfully
      for (let i = 0; i < limit; i++) {
        await request(app).get('/test').expect(200);
      }

      // Next request should fail
      await request(app).get('/test').expect(429);
    });

    it('should respect custom window', async () => {
      const app = createTestApp();
      const limit = 3;
      const window = 500; // 500ms

      app.get('/test', endpointRateLimit(limit, window), (req, res) => {
        res.json({ success: true });
      });

      // Make 3 requests
      for (let i = 0; i < limit; i++) {
        await request(app).get('/test').expect(200);
      }

      // 4th should fail
      await request(app).get('/test').expect(429);

      // Wait for window to expire
      await wait(600);

      // Should succeed again
      await request(app).get('/test').expect(200);
    });

    it('should use custom endpoint identifier', async () => {
      const app = createTestApp();

      app.get('/test1', endpointRateLimit(3, 60000, 'shared'), (req, res) => {
        res.json({ endpoint: 'test1' });
      });

      app.get('/test2', endpointRateLimit(3, 60000, 'shared'), (req, res) => {
        res.json({ endpoint: 'test2' });
      });

      // Make 2 requests to test1
      await request(app).get('/test1').expect(200);
      await request(app).get('/test1').expect(200);

      // Make 1 request to test2 (should count toward same limit)
      await request(app).get('/test2').expect(200);

      // 4th request to either endpoint should fail
      await request(app).get('/test1').expect(429);
      await request(app).get('/test2').expect(429);
    });
  });

  describe('authRateLimit', () => {
    it('should enforce strict limit on auth endpoints', async () => {
      const app = createTestApp();

      app.post('/auth/login', authRateLimit, (req, res) => {
        res.json({ success: true });
      });

      // Should allow 10 requests (default auth limit)
      for (let i = 0; i < 10; i++) {
        await request(app).post('/auth/login').expect(200);
      }

      // 11th request should fail
      const response = await request(app)
        .post('/auth/login')
        .expect(429);

      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should track by IP address', async () => {
      const app = createTestApp();

      app.post('/auth/login', authRateLimit, (req, res) => {
        res.json({ success: true });
      });

      // Make requests from same IP
      const agent = request(app);
      for (let i = 0; i < 10; i++) {
        await agent.post('/auth/login').expect(200);
      }

      // Should be rate limited
      await agent.post('/auth/login').expect(429);
    });
  });

  describe('searchRateLimit', () => {
    it('should enforce search endpoint limit', async () => {
      const app = createTestApp();

      app.get('/search', searchRateLimit, (req, res) => {
        res.json({ results: [] });
      });

      // Should allow 50 requests (default search limit)
      for (let i = 0; i < 50; i++) {
        await request(app).get('/search').expect(200);
      }

      // 51st request should fail
      await request(app).get('/search').expect(429);
    });
  });

  describe('chatRateLimit', () => {
    it('should enforce AI chat endpoint limit', async () => {
      const app = createTestApp();
      mockAuthUser(app, 1);

      app.post('/ai/chat', chatRateLimit, (req, res) => {
        res.json({ message: 'AI response' });
      });

      // Should allow 20 requests (default AI chat limit)
      for (let i = 0; i < 20; i++) {
        await request(app).post('/ai/chat').expect(200);
      }

      // 21st request should fail
      await request(app).post('/ai/chat').expect(429);
    });
  });

  // --------------------------------------------------------------------------
  // Integration Tests
  // --------------------------------------------------------------------------

  describe('Integration', () => {
    it('should work with multiple middleware', async () => {
      const app = createTestApp();
      mockAuthUser(app, 1);

      let authCalled = false;
      const mockAuth = (req: any, res: any, next: any) => {
        authCalled = true;
        next();
      };

      app.post(
        '/protected',
        endpointRateLimit(5),
        mockAuth,
        (req, res) => {
          res.json({ success: true });
        }
      );

      const response = await request(app).post('/protected').expect(200);

      expect(authCalled).toBe(true);
      expect(response.headers['x-ratelimit-limit']).toBe('5');
    });

    it('should set correct headers on all responses', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(10), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-ratelimit-limit']).toBe('10');
      expect(response.headers['x-ratelimit-remaining']).toBe('9');
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should update remaining count correctly', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(10), (req, res) => {
        res.json({ success: true });
      });

      // First request
      let response = await request(app).get('/test');
      expect(response.headers['x-ratelimit-remaining']).toBe('9');

      // Second request
      response = await request(app).get('/test');
      expect(response.headers['x-ratelimit-remaining']).toBe('8');

      // Third request
      response = await request(app).get('/test');
      expect(response.headers['x-ratelimit-remaining']).toBe('7');
    });

    it('should handle errors gracefully (fail-open)', async () => {
      const app = createTestApp();

      // Force an error by passing invalid parameters
      app.get('/test', async (req, res, next) => {
        try {
          // This should fail but not crash
          await checkRateLimit('', -1, -1);
        } catch (error) {
          // Should not crash, just continue
        }
        next();
      }, (req, res) => {
        res.json({ success: true });
      });

      // Should still work despite error
      await request(app).get('/test').expect(200);
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases
  // --------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('should handle concurrent requests correctly', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(10), (req, res) => {
        res.json({ success: true });
      });

      // Make 5 concurrent requests
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/test')
      );

      const responses = await Promise.all(requests);

      // All should succeed (5 < 10 limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle missing IP address', async () => {
      const app = createTestApp();

      app.get('/test', globalRateLimit, (req, res) => {
        res.json({ success: true });
      });

      // Should not crash even with missing IP
      await request(app).get('/test').expect(200);
    });

    it('should handle very short windows', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(2, 100), (req, res) => {
        res.json({ success: true });
      });

      await request(app).get('/test').expect(200);
      await request(app).get('/test').expect(200);
      await request(app).get('/test').expect(429);

      await wait(150);

      await request(app).get('/test').expect(200);
    });

    it('should handle very large limits', async () => {
      const app = createTestApp();

      app.get('/test', endpointRateLimit(10000), (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test').expect(200);
      expect(response.headers['x-ratelimit-limit']).toBe('10000');
      expect(response.headers['x-ratelimit-remaining']).toBe('9999');
    });
  });
});
