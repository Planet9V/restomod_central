# Rate Limiting - Quick Start Guide

## 30-Second Integration

### 1. Import
```typescript
import { authRateLimit, searchRateLimit, chatRateLimit } from '../middleware/rateLimitMiddleware';
```

### 2. Apply
```typescript
router.post('/api/auth/login', authRateLimit, loginHandler);
router.get('/api/cars', searchRateLimit, carsHandler);
router.post('/api/ai/chat', chatRateLimit, chatHandler);
```

### 3. Done! ✅

Your endpoints are now protected with rate limiting.

---

## Rate Limits

| Middleware | Limit | Use For |
|------------|-------|---------|
| `authRateLimit` | 10/min | Login, Register, Password Reset |
| `searchRateLimit` | 50/min | Search, Filter, List endpoints |
| `chatRateLimit` | 20/min | AI Chat, Embeddings |
| `endpointRateLimit(N)` | Custom | Any endpoint needing specific limit |
| `globalRateLimit` | 100-1000/min | General API protection (tier-based) |

---

## Examples

### Auth Endpoints
```typescript
router.post('/api/auth/login', authRateLimit, loginHandler);
router.post('/api/auth/register', authRateLimit, registerHandler);
```

### Search Endpoints
```typescript
router.get('/api/cars', searchRateLimit, carsHandler);
router.get('/api/events', searchRateLimit, eventsHandler);
```

### AI Endpoints
```typescript
router.post('/api/ai/chat', chatRateLimit, requireAuth, chatHandler);
```

### Custom Limits
```typescript
router.post('/api/expensive', endpointRateLimit(5), handler); // 5/min
router.get('/api/cheap', endpointRateLimit(200), handler);    // 200/min
```

### Global (All Routes)
```typescript
app.use('/api', globalRateLimit);
```

---

## Configuration (Optional)

Create `.env` file:
```bash
RATE_LIMIT_AUTH=10
RATE_LIMIT_SEARCH=50
RATE_LIMIT_AI_CHAT=20
RATE_LIMIT_ANONYMOUS=100
RATE_LIMIT_PREMIUM=500
RATE_LIMIT_ADMIN=1000
```

---

## Testing

```bash
# Make 12 requests to test auth limit (10/min)
for i in {1..12}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
done
```

**Expected**: First 10 succeed, last 2 fail with 429

---

## Response Headers

Every response includes:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1700000000
```

When limit exceeded (429 error):
```
Retry-After: 45
```

---

## Files

- **`rateLimitMiddleware.ts`** - Main implementation
- **`RATE_LIMITING_GUIDE.md`** - Complete documentation
- **`INTEGRATION_EXAMPLE.md`** - Step-by-step integration
- **`rateLimitMiddleware.examples.ts`** - Code examples
- **`__tests__/rateLimitMiddleware.test.ts`** - Tests
- **`IMPLEMENTATION_REPORT.md`** - Full project report
- **`QUICK_START.md`** - This file

---

## Need More Help?

1. **Integration**: Read `INTEGRATION_EXAMPLE.md`
2. **Full Docs**: Read `RATE_LIMITING_GUIDE.md`
3. **Examples**: Read `rateLimitMiddleware.examples.ts`
4. **Tests**: Run `npm run test __tests__/rateLimitMiddleware.test.ts`

---

**That's it! Your API is now protected.** 🚀
