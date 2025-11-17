# Free Infrastructure Setup - PostHog & Sentry

**Date:** 2025-01-17
**Status:** ✅ Completed
**Cost:** $0/month (using free tiers)
**ICE Score:** 850 (High value, zero cost, quick setup)

## Overview

This document details the setup of free, production-ready infrastructure services for Restomod Central:

1. **PostHog** - User analytics, feature flags, session replay (FREE: 1M events/month)
2. **Sentry** - Error tracking, performance monitoring (FREE: 5K errors/month)

Both services are fully integrated on server and client side, with privacy-focused configurations and graceful degradation when disabled.

---

## PostHog Analytics

### What is PostHog?

PostHog is an open-source product analytics platform that provides:
- **User Analytics** - Track user behavior, page views, custom events
- **Feature Flags** - A/B testing and gradual rollouts
- **Session Replay** - See exactly what users see (with privacy controls)
- **Funnels** - Conversion tracking and optimization
- **Retention** - User engagement and churn analysis

### Free Tier Limits

- ✅ **1 million events per month**
- ✅ **Unlimited users**
- ✅ **Unlimited projects**
- ✅ **5,000 session replays per month**
- ✅ **Unlimited feature flags**
- ✅ **1-year data retention**

### Setup Instructions

#### 1. Create PostHog Account

1. Go to https://posthog.com/
2. Click "Get started - free"
3. Sign up with email or GitHub
4. Create your first project
5. Copy your API key from Project Settings

#### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Server-side (Node.js)
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com

# Client-side (React - must start with VITE_)
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Note:** You can use the same API key for both server and client, or create separate projects for better organization.

#### 3. Server-Side Integration

The server-side PostHog client is automatically initialized when `POSTHOG_API_KEY` is set.

**Location:** `server/services/analytics/posthogService.ts`

**Usage Examples:**

```typescript
import { trackEvent, identifyUser, trackCarView } from '@/services/analytics/posthogService';

// Track custom event
trackEvent(userId, 'button_clicked', {
  button: 'cta',
  page: '/cars',
});

// Identify user
identifyUser(userId, {
  email: 'user@example.com',
  plan: 'premium',
  signupDate: '2025-01-17',
});

// Track car view (pre-built helper)
trackCarView(userId, carId, {
  make: 'Ford',
  model: 'Mustang',
  year: 1967,
  price: 85000,
});
```

#### 4. Client-Side Integration

The client-side PostHog is initialized in your React app.

**Location:** `client/lib/posthog.ts`

**Integration in main.tsx:**

```typescript
import { initPostHog } from './lib/posthog';

// Initialize PostHog
initPostHog();

// Then render your app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Usage in Components:**

```typescript
import { usePostHog, analytics } from '@/lib/posthog';

function CarDetailPage({ carId }: { carId: number }) {
  const posthog = usePostHog();

  useEffect(() => {
    // Track page view
    posthog.capture('$pageview', { car_id: carId });

    // Or use helper
    analytics.carView(carId, { make: 'Ford', model: 'Mustang' });
  }, [carId]);

  return <div>...</div>;
}
```

### Privacy Configuration

PostHog is configured with privacy-first defaults:

**Server-side:**
- ✅ Automatic event batching (flush every 10s or 20 events)
- ✅ Graceful shutdown handling
- ✅ No user data sent if API key missing

**Client-side:**
- ✅ Mask all text in session replays (`maskAllInputs: true`)
- ✅ Respect Do Not Track (`respect_dnt: true`)
- ✅ localStorage persistence (no cookies)
- ✅ Automatic pageview tracking (opt-in)

### Common Events Tracked

| Event | Description | Properties |
|-------|-------------|------------|
| `$pageview` | Page view | `$current_url`, `car_id`, `event_id` |
| `car_view` | User views car details | `car_id`, `make`, `model`, `year`, `price` |
| `search` | User performs search | `query`, `filters`, `result_count` |
| `ai_chat_message` | User sends AI chat | `conversation_id`, `message_length`, `response_time_ms` |
| `bookmark` | User bookmarks item | `item_id`, `item_type`, `action` (add/remove) |
| `signup` | User creates account | `method` (email/google/facebook) |
| `login` | User logs in | `method` (email/google/facebook) |

### Feature Flags

Create feature flags in PostHog dashboard and use them to control rollouts:

**Server-side:**
```typescript
import { isFeatureEnabled } from '@/services/analytics/posthogService';

const showNewUI = await isFeatureEnabled(userId, 'new-ui-redesign');
if (showNewUI) {
  // Serve new UI
}
```

**Client-side:**
```typescript
import { useFeatureFlag } from '@/lib/posthog';

function Dashboard() {
  const showBeta = useFeatureFlag('beta-features');

  return (
    <div>
      {showBeta && <BetaFeatures />}
    </div>
  );
}
```

---

## Sentry Error Tracking

### What is Sentry?

Sentry is an error monitoring and performance tracking platform that provides:
- **Error Tracking** - Automatic error capture with stack traces
- **Performance Monitoring** - Transaction tracing and slow queries
- **Release Tracking** - Monitor errors by release version
- **User Feedback** - Let users report issues
- **Breadcrumbs** - See what happened before an error

### Free Tier Limits

- ✅ **5,000 errors per month**
- ✅ **10,000 performance units per month**
- ✅ **Unlimited projects**
- ✅ **30 days data retention**
- ✅ **Source maps support**

### Setup Instructions

#### 1. Create Sentry Account

1. Go to https://sentry.io/
2. Click "Get started"
3. Sign up with email or GitHub
4. Create a new project:
   - Platform: **Node.js** (for server)
   - Platform: **React** (for client)
5. Copy your DSN from Project Settings

#### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Server-side Sentry DSN
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# Client-side Sentry DSN (must start with VITE_)
VITE_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# Git commit for release tracking (optional but recommended)
GIT_COMMIT=$(git rev-parse --short HEAD)
VITE_GIT_COMMIT=$(git rev-parse --short HEAD)
```

**Tip:** You can create separate projects for server and client, or use the same DSN.

#### 3. Server-Side Integration

The server-side Sentry client is automatically initialized when `SENTRY_DSN` is set.

**Location:** `server/services/errorTracking/sentryService.ts`

**Express Integration** (in `server/index.ts`):

```typescript
import { setupSentryMiddleware, setupSentryErrorHandler } from './services/errorTracking/sentryService';

// BEFORE all routes
setupSentryMiddleware(app);

// ... your routes ...

// AFTER all routes, BEFORE other error handlers
setupSentryErrorHandler(app);
```

**Usage Examples:**

```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/services/errorTracking/sentryService';

// Capture exception with context
try {
  await processPayment(userId, amount);
} catch (error) {
  captureException(error, {
    user: { id: userId, email: userEmail },
    tags: { payment_method: 'stripe' },
    extra: { amount, currency: 'USD' },
    level: 'error',
  });
  throw error;
}

// Capture message for warnings
captureMessage('Unusual activity detected', 'warning', {
  user: { id: userId },
  tags: { anomaly_type: 'high_requests' },
});

// Add breadcrumb for debugging
addBreadcrumb('User clicked checkout', 'user.action', {
  cart_value: 100,
  items: 3,
});
```

#### 4. Client-Side Integration

The client-side Sentry is initialized in your React app.

**Location:** `client/lib/sentry.ts`

**Integration in main.tsx:**

```typescript
import { initSentry, ErrorBoundary } from './lib/sentry';

// Initialize Sentry
initSentry();

// Wrap app with ErrorBoundary
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Error Fallback Component:**

```typescript
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-page">
      <h1>Oops! Something went wrong</h1>
      <p>We've been notified and are working on a fix.</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}
```

**Manual Error Capture:**

```typescript
import { captureException, setUser } from '@/lib/sentry';

// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Capture error
try {
  await fetchCarData(carId);
} catch (error) {
  captureException(error, {
    tags: { car_id: carId.toString() },
    extra: { retry_count: 3 },
  });
}
```

### Performance Monitoring

Sentry automatically tracks:
- ✅ HTTP requests (server-side)
- ✅ Database queries (if configured)
- ✅ Page loads (client-side)
- ✅ Component render times (with Profiler)

**Server-side Transaction Tracking:**

```typescript
import { startTransaction } from '@/services/errorTracking/sentryService';

const transaction = startTransaction('GET /api/cars/:id', 'http.server');
try {
  const car = await fetchCar(carId);
  transaction.setStatus('ok');
  return car;
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

**Client-side Profiler:**

```typescript
import { Profiler } from '@/lib/sentry';

function App() {
  return (
    <Profiler name="MainApp">
      <Dashboard />
      <CarList />
    </Profiler>
  );
}
```

### Privacy & Security

Both services are configured with privacy-first defaults:

**Data Filtering:**
- ✅ Authorization headers removed
- ✅ Cookie headers removed
- ✅ API keys filtered
- ✅ Password fields filtered
- ✅ Sensitive query params removed

**Sentry-specific:**
- ✅ Errors NOT sent in development mode
- ✅ Source maps for readable stack traces
- ✅ 10% sampling in production (configurable)

---

## Verification & Testing

### Verify PostHog Integration

```bash
# 1. Start server
npm run dev

# 2. Check logs for:
✅ PostHog analytics initialized

# 3. Test event tracking
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# 4. Check PostHog dashboard:
# - Go to https://app.posthog.com/events
# - Look for 'login' event
# - Should appear within 10 seconds
```

### Verify Sentry Integration

```bash
# 1. Start server
npm run dev

# 2. Check logs for:
✅ Sentry error tracking initialized

# 3. Trigger test error
curl http://localhost:5000/api/test-error

# 4. Check Sentry dashboard:
# - Go to https://sentry.io/issues/
# - Look for test error
# - Should appear immediately
```

### Frontend Verification

1. Open browser to http://localhost:5000
2. Open DevTools Console
3. Look for:
   - `✅ PostHog analytics loaded`
   - `✅ Sentry error tracking initialized`
4. Navigate to a car page
5. Check PostHog dashboard for pageview events

---

## Deployment Considerations

### Environment Variables Checklist

Before deploying, ensure all required environment variables are set:

**Production:**
```bash
# PostHog
POSTHOG_API_KEY=phc_prod_xxxxx
VITE_POSTHOG_KEY=phc_prod_xxxxx

# Sentry
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
VITE_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz

# Release tracking
GIT_COMMIT=$(git rev-parse HEAD)
VITE_GIT_COMMIT=$(git rev-parse HEAD)
```

**Staging:**
```bash
# Use separate projects for staging
POSTHOG_API_KEY=phc_staging_xxxxx
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/staging
```

### Build-time Configuration

For Vite to include environment variables, they MUST start with `VITE_`:

```bash
# ✅ Correct - will be included in build
VITE_POSTHOG_KEY=xxx
VITE_SENTRY_DSN=xxx

# ❌ Wrong - will NOT be included
POSTHOG_KEY=xxx
SENTRY_DSN=xxx (server-side only)
```

### Vercel Deployment

1. Go to Vercel dashboard → Settings → Environment Variables
2. Add all `VITE_*` variables for Production
3. Add all server variables (`POSTHOG_API_KEY`, `SENTRY_DSN`)
4. Enable "Automatically include git commit" for `GIT_COMMIT`

### Railway Deployment

1. Go to Railway dashboard → Variables
2. Add all environment variables
3. Set `GIT_COMMIT=${{RAILWAY_GIT_COMMIT_SHA}}`

---

## Monitoring & Alerts

### PostHog Alerts

Set up alerts in PostHog for:
- 📉 **Conversion funnel drop-offs** (e.g., search → view → bookmark)
- 📈 **Unusual spikes** in error events
- 🔔 **Feature flag changes** affecting >10% of users

### Sentry Alerts

Set up alerts in Sentry for:
- 🚨 **New issues** (first occurrence of an error)
- 📊 **High error rate** (>10 errors/minute)
- ⚠️ **Performance degradation** (P95 > 1 second)
- 💥 **Critical errors** (database connection failures)

---

## Cost Optimization

Both services have generous free tiers, but here's how to optimize if you approach limits:

### PostHog (1M events/month)

**Current usage estimate:** ~300K events/month
- 100K pageviews
- 50K car views
- 50K search queries
- 50K AI chat messages
- 50K other events

**If approaching limit:**
1. ✅ **Sample events** (track 50% of pageviews)
2. ✅ **Remove verbose events** (track user actions, not every click)
3. ✅ **Increase flush interval** (20s → 60s)
4. ⚠️ **Upgrade to $0.00005/event** ($50 for 1M extra events)

### Sentry (5K errors/month)

**Current usage estimate:** ~1K errors/month (should be much lower!)
- Assuming 99.9% uptime
- 1M requests/month × 0.1% error rate = 1K errors

**If approaching limit:**
1. ✅ **Fix errors!** (that's the point!)
2. ✅ **Lower sample rate** (10% → 5%)
3. ✅ **Filter noisy errors** (network errors, browser extensions)
4. ⚠️ **Upgrade to Sentry Business** ($26/month for 50K errors)

---

## Troubleshooting

### PostHog events not showing up

1. **Check API key:** `echo $POSTHOG_API_KEY`
2. **Check network:** Look for `POST https://app.posthog.com/batch/` in Network tab
3. **Check queue:** Events are batched (wait 10 seconds or flush manually)
4. **Check filters:** Dashboard may have date/user filters applied

### Sentry errors not showing up

1. **Check DSN:** `echo $SENTRY_DSN`
2. **Check environment:** Development errors are NOT sent by default
3. **Check sample rate:** May be filtered by sampling (set to 1.0 for 100%)
4. **Check ignored errors:** May match `ignoreErrors` patterns

### Build errors with Vite

```
ReferenceError: process is not defined
```

**Solution:** Environment variables must start with `VITE_`:
```bash
# ❌ Wrong
POSTHOG_KEY=xxx

# ✅ Correct
VITE_POSTHOG_KEY=xxx
```

---

## Next Steps

With PostHog and Sentry configured, you can:

1. ✅ **Monitor user behavior** in real-time
2. ✅ **Track conversion funnels** (sign-up → bookmark → contact dealer)
3. ✅ **A/B test new features** with feature flags
4. ✅ **Get alerted to errors** before users complain
5. ✅ **Optimize performance** with transaction tracking
6. ✅ **Understand user retention** and churn

**Recommended Reading:**
- [PostHog Docs](https://posthog.com/docs)
- [Sentry Docs](https://docs.sentry.io/)
- [GDPR Compliance Guide](https://posthog.com/docs/privacy/gdpr-compliance)

---

**Status:** ✅ Complete
**Cost:** $0/month
**Estimated Time Saved:** 20 hours/month (fewer bugs, better insights)
**ROI:** Priceless 🚀
