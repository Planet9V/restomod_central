# Rate Limiting Integration - Practical Example

This guide shows how to integrate rate limiting middleware into existing route files.

## Quick Start: 3-Step Integration

### Step 1: Import the Middleware

```typescript
// At the top of your route file (e.g., server/routes/auth.ts)
import {
  authRateLimit,
  searchRateLimit,
  chatRateLimit,
  endpointRateLimit,
  globalRateLimit
} from '../middleware/rateLimitMiddleware';
```

### Step 2: Add to Routes

```typescript
// BEFORE: Without rate limiting
router.post('/api/auth/login', async (req, res) => {
  // Login handler
});

// AFTER: With rate limiting
router.post('/api/auth/login', authRateLimit, async (req, res) => {
  // Login handler
});
```

### Step 3: Test

```bash
# Make multiple requests to verify rate limiting
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Example 1: Authentication Routes (auth.ts)

### Before Integration

```typescript
/**
 * Authentication Routes - SPEC_02_API_ENDPOINTS.md
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Registration logic
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Login logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    // Forgot password logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
```

### After Integration

```typescript
/**
 * Authentication Routes - SPEC_02_API_ENDPOINTS.md
 * WITH RATE LIMITING - Phase 2.5
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRateLimit } from '../middleware/rateLimitMiddleware'; // ADD THIS

const router = Router();

// Register endpoint - PROTECTED with rate limiting
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    // Registration logic
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Login endpoint - PROTECTED with rate limiting
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    // Login logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Forgot password endpoint - PROTECTED with rate limiting
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    // Forgot password logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Reset password endpoint - PROTECTED with rate limiting
router.post('/reset-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    // Reset password logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
```

**Changes Made:**
1. Import `authRateLimit` from middleware
2. Add `authRateLimit` as middleware to each auth endpoint
3. Now limited to 10 requests/minute per IP to prevent brute force attacks

---

## Example 2: Car Search Routes (cars.ts)

### Before Integration

```typescript
import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Search cars
router.get('/', optionalAuth, async (req, res) => {
  // Search logic
  res.json({ success: true, data: { cars: [] } });
});

// Get car by ID
router.get('/:id', optionalAuth, async (req, res) => {
  // Get car logic
  res.json({ success: true, data: { car: {} } });
});

export default router;
```

### After Integration

```typescript
import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import { searchRateLimit, endpointRateLimit } from '../middleware/rateLimitMiddleware'; // ADD THIS

const router = Router();

// Search cars - PROTECTED with search rate limiting
router.get('/', searchRateLimit, optionalAuth, async (req, res) => {
  // Search logic
  res.json({ success: true, data: { cars: [] } });
});

// Get car by ID - PROTECTED with custom rate limiting
router.get('/:id', endpointRateLimit(100), optionalAuth, async (req, res) => {
  // Get car logic
  res.json({ success: true, data: { car: {} } });
});

export default router;
```

**Changes Made:**
1. Import rate limiting middleware
2. Add `searchRateLimit` to search endpoint (50 req/min)
3. Add custom limit to detail endpoint (100 req/min)
4. Rate limiting comes BEFORE authentication (recommended)

---

## Example 3: AI Chat Routes (ai.ts)

### New File with Rate Limiting

```typescript
/**
 * AI Chat Routes - SPEC_02_API_ENDPOINTS.md
 * WITH RATE LIMITING from the start
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { chatRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();

// Chat endpoint - PROTECTED with AI rate limiting
router.post('/chat', chatRateLimit, requireAuth, async (req, res) => {
  try {
    // AI chat logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Get conversations - PROTECTED with AI rate limiting
router.get('/conversations', chatRateLimit, requireAuth, async (req, res) => {
  try {
    // Get conversations logic
    res.json({ success: true, data: { conversations: [] } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Get conversation messages - PROTECTED with AI rate limiting
router.get('/conversations/:id/messages', chatRateLimit, requireAuth, async (req, res) => {
  try {
    // Get messages logic
    res.json({ success: true, data: { messages: [] } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
```

**Best Practices:**
- Rate limiting before authentication (more efficient)
- Consistent rate limiting across related endpoints
- All AI endpoints use `chatRateLimit` (20 req/min)

---

## Example 4: Admin Routes with Multiple Middleware

```typescript
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { endpointRateLimit, globalRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();

// Get all users - Global rate limiting
router.get('/users', globalRateLimit, requireAuth, requireAdmin, async (req, res) => {
  // Get users logic
  res.json({ success: true });
});

// Trigger scraper - Custom strict rate limiting
router.post('/scrapers/:id/run',
  endpointRateLimit(5, 60000), // Only 5 runs per minute
  requireAuth,
  requireAdmin,
  async (req, res) => {
    // Trigger scraper logic
    res.json({ success: true });
  }
);

// Analytics endpoint - Custom moderate rate limiting
router.get('/analytics/dashboard',
  endpointRateLimit(20, 60000), // 20 requests per minute
  requireAuth,
  requireAdmin,
  async (req, res) => {
    // Analytics logic
    res.json({ success: true });
  }
);

export default router;
```

**Middleware Order:**
1. Rate limiting (first - protect resources)
2. Authentication (second - identify user)
3. Authorization (third - check permissions)
4. Handler (last - execute logic)

---

## Example 5: Main App Integration (server/index.ts)

### Before Integration

```typescript
import express from 'express';
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import bookmarkRoutes from './routes/bookmarks';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### After Integration (Option A: Global Rate Limiting)

```typescript
import express from 'express';
import { globalRateLimit } from './middleware/rateLimitMiddleware'; // ADD THIS
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import bookmarkRoutes from './routes/bookmarks';

const app = express();

// Middleware
app.use(express.json());

// Global rate limiting for ALL API routes
app.use('/api', globalRateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### After Integration (Option B: Route-Specific)

```typescript
import express from 'express';
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import bookmarkRoutes from './routes/bookmarks';

const app = express();

// Middleware
app.use(express.json());

// Routes (rate limiting configured within each route file)
app.use('/api/auth', authRoutes);      // Uses authRateLimit internally
app.use('/api/cars', carRoutes);       // Uses searchRateLimit internally
app.use('/api/bookmarks', bookmarkRoutes); // Uses custom limits internally

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

**Recommendation**: Use **Option B** (route-specific) for more granular control.

---

## Testing Integration

### Manual Testing

```bash
# Test auth rate limiting (10 req/min)
for i in {1..12}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' \
    -i | grep -E "(HTTP|X-RateLimit|Retry-After)"
  echo "---"
done

# Test search rate limiting (50 req/min)
for i in {1..52}; do
  curl http://localhost:5000/api/cars \
    -H "Accept: application/json" \
    -i | grep -E "(HTTP|X-RateLimit)"
done
```

### Expected Results

Requests 1-10 (auth):
```
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1700000000
```

Request 11 (auth):
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000000
Retry-After: 45
```

---

## Troubleshooting Integration

### Issue: Rate limiting not working

**Check 1: Middleware order**
```typescript
// WRONG - rate limit after auth
router.post('/login', requireAuth, authRateLimit, handler);

// CORRECT - rate limit before auth
router.post('/login', authRateLimit, requireAuth, handler);
```

**Check 2: Import path**
```typescript
// WRONG - missing middleware directory
import { authRateLimit } from './rateLimitMiddleware';

// CORRECT - include middleware directory
import { authRateLimit } from '../middleware/rateLimitMiddleware';
```

**Check 3: Middleware invocation**
```typescript
// WRONG - not invoking middleware
router.post('/login', authRateLimit(), handler);

// CORRECT - middleware function reference
router.post('/login', authRateLimit, handler);
```

### Issue: Different limits than expected

**Check: Environment variables**
```bash
# Check if env vars are set
echo $RATE_LIMIT_AUTH
echo $RATE_LIMIT_SEARCH

# Set custom limits
export RATE_LIMIT_AUTH=20
export RATE_LIMIT_SEARCH=100
```

### Issue: Rate limiting too strict

**Solution: Use custom limits**
```typescript
// Instead of searchRateLimit (50 req/min)
router.get('/cars', searchRateLimit, handler);

// Use custom limit (100 req/min)
router.get('/cars', endpointRateLimit(100), handler);
```

---

## Integration Checklist

- [ ] Import rate limiting middleware in route files
- [ ] Add `authRateLimit` to all auth endpoints
- [ ] Add `searchRateLimit` to all search endpoints
- [ ] Add `chatRateLimit` to all AI endpoints
- [ ] Add custom limits for special endpoints
- [ ] Test rate limiting with curl or Postman
- [ ] Verify headers are returned correctly
- [ ] Verify 429 responses for exceeded limits
- [ ] Document rate limits in API documentation
- [ ] Configure environment variables for production

---

## Production Deployment

### Environment Variables

```bash
# .env.production

# Rate Limits (requests per minute)
RATE_LIMIT_ANONYMOUS=100
RATE_LIMIT_PREMIUM=500
RATE_LIMIT_ADMIN=1000
RATE_LIMIT_SEARCH=50
RATE_LIMIT_AI_CHAT=20
RATE_LIMIT_AUTH=10

# JWT Secret
JWT_SECRET=your-production-secret-key-here
```

### Monitoring

Add rate limit monitoring to your logging:

```typescript
import { getRateLimitStats } from './middleware/rateLimitMiddleware';

// Log stats every 5 minutes
setInterval(() => {
  const stats = getRateLimitStats();
  console.log(`[RateLimit] Active keys: ${stats.totalKeys}`);
  console.log(`[RateLimit] Memory: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
}, 5 * 60 * 1000);
```

### Admin Dashboard

Add rate limit stats to admin dashboard:

```typescript
import { getRateLimitStats } from '../middleware/rateLimitMiddleware';

router.get('/admin/stats/rate-limits', requireAdmin, (req, res) => {
  const stats = getRateLimitStats();

  res.json({
    success: true,
    data: {
      activeKeys: stats.totalKeys,
      memoryUsageBytes: stats.memoryUsage,
      memoryUsageMB: (stats.memoryUsage / 1024 / 1024).toFixed(2)
    }
  });
});
```

---

## Summary

**Integration is simple:**

1. **Import** the appropriate middleware function
2. **Add** it to your route as middleware (before handler)
3. **Test** with multiple requests to verify it works

**Choose the right middleware:**
- `authRateLimit` - Auth endpoints (10/min)
- `searchRateLimit` - Search endpoints (50/min)
- `chatRateLimit` - AI endpoints (20/min)
- `endpointRateLimit(N)` - Custom limits
- `globalRateLimit` - Tier-based global limits

**Best practices:**
- Rate limiting BEFORE authentication
- Consistent limits for related endpoints
- Test in development before deploying
- Monitor rate limit stats in production

---

**Need Help?** See:
- `RATE_LIMITING_GUIDE.md` - Full documentation
- `rateLimitMiddleware.examples.ts` - More examples
- `__tests__/rateLimitMiddleware.test.ts` - Test cases
