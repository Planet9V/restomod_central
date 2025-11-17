# Phase 6: Testing & Deployment Quick Start Guide

This guide will help you get started with the Phase 6 testing and deployment infrastructure in under 30 minutes.

## Prerequisites

- Node.js 20.x installed
- GitHub account with repository access
- Neon PostgreSQL database (already configured)
- npm or pnpm package manager

## Step 1: Update Package Scripts (5 minutes)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    // Existing scripts...

    // Enhanced testing scripts
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",

    // E2E testing scripts
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",

    // Lighthouse performance testing
    "test:lighthouse": "lhci autorun",

    // Lint scripts (add if not exists)
    "lint": "echo 'Add ESLint configuration'",
    "lint:fix": "echo 'Add ESLint fix configuration'"
  }
}
```

## Step 2: Install Additional Dependencies (3 minutes)

```bash
# Install test coverage tools
npm install -D @vitest/coverage-v8 @vitest/ui

# Install Playwright and browsers
npx playwright install --with-deps

# Install Lighthouse CI
npm install -D @lhci/cli

# Install React Testing Library (optional, for component tests)
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Step 3: Update Vitest Configuration (2 minutes)

Update your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts',
        'scripts/',
      ],
      thresholds: {
        lines: 60,      // Start at 60%, increase gradually
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@db': path.resolve(__dirname, './db'),
      '@server': path.resolve(__dirname, './server'),
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});
```

## Step 4: Run Your First Tests (2 minutes)

```bash
# Run existing tests
npm test

# Run tests with coverage
npm run test:coverage

# Open coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Step 5: Configure GitHub Actions (5 minutes)

The CI workflow has already been created at `.github/workflows/ci.yml`.

To activate it:

1. Commit the workflow files:
```bash
git add .github/
git commit -m "feat: Add CI/CD pipeline with GitHub Actions"
git push
```

2. Go to your GitHub repository
3. Click "Actions" tab
4. You should see the workflow running

## Step 6: Run E2E Tests (5 minutes)

```bash
# Make sure your dev server is running OR let Playwright start it
npm run test:e2e

# Run in UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/homepage.spec.ts
```

## Step 7: Set Up Dependabot (1 minute)

The configuration is already created at `.github/dependabot.yml`.

Update the reviewer username:
```yaml
reviewers:
  - "your-github-username"  # Change this to your GitHub username
assignees:
  - "your-github-username"  # Change this to your GitHub username
```

Commit and push:
```bash
git add .github/dependabot.yml
git commit -m "feat: Configure Dependabot for automated dependency updates"
git push
```

## Step 8: Optional - Set Up Error Tracking with Sentry (10 minutes)

1. Sign up at https://sentry.io (free tier available)

2. Create a new project for "Express" (backend) and "React" (frontend)

3. Install Sentry:
```bash
npm install @sentry/node @sentry/react
```

4. Add to your backend (`server/index.ts`):
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Add before routes
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add after routes but before error handlers
app.use(Sentry.Handlers.errorHandler());
```

5. Add to your frontend (`client/src/main.tsx`):
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

6. Add to `.env`:
```bash
SENTRY_DSN=your-sentry-dsn-here
```

7. Add to `.env.postgres.example`:
```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
```

## Quick Verification Checklist

After completing the setup, verify everything works:

- [ ] `npm test` runs successfully
- [ ] `npm run test:coverage` generates coverage report
- [ ] `npm run test:e2e` runs Playwright tests
- [ ] GitHub Actions workflow runs on push
- [ ] Dependabot is active in repository
- [ ] Coverage report shows in `coverage/` directory
- [ ] Playwright report shows in `playwright-report/`

## Common Issues & Solutions

### Issue: "Playwright browsers not found"
```bash
npx playwright install --with-deps
```

### Issue: "Coverage thresholds not met"
Lower the thresholds in `vitest.config.ts` initially:
```typescript
thresholds: {
  lines: 40,
  functions: 40,
  branches: 30,
  statements: 40,
}
```

### Issue: "PostgreSQL connection failed in tests"
Make sure DATABASE_URL is set in your test environment:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db"
```

### Issue: "GitHub Actions failing on database tests"
The workflow includes a PostgreSQL service. Check that:
- The service is healthy before tests run
- DATABASE_URL environment variable is set correctly
- POSTGRES_SCHEMA is set to "true"

## Next Steps

After completing this quick start:

1. **Write More Tests:** Add tests for critical user flows
2. **Set Up Deployment:** Configure Vercel or Railway
3. **Add Monitoring:** Set up PostHog for analytics
4. **Security Scan:** Configure Snyk for vulnerability scanning
5. **Performance Testing:** Set up k6 for load testing

## Resources

- **Full Strategy:** See `docs/PHASE_6_TESTING_DEPLOYMENT_STRATEGY.md`
- **Vitest Docs:** https://vitest.dev
- **Playwright Docs:** https://playwright.dev
- **GitHub Actions:** https://docs.github.com/actions

## Getting Help

If you encounter issues:

1. Check the logs in GitHub Actions
2. Run tests locally with `--reporter=verbose`
3. Review the full strategy document for detailed explanations
4. Check the existing test files for examples:
   - `server/__tests__/setup/database.test.ts`
   - `server/api/cars.test.ts`
   - `e2e/homepage.spec.ts`

## Estimated Timeline

- **Quick Start Setup:** 30 minutes
- **Writing Basic Tests:** 2-4 hours
- **Full CI/CD Setup:** 1 day
- **Complete Phase 6 Implementation:** 2-4 weeks

---

**Congratulations!** You now have a solid testing and deployment foundation. Continue to Phase 2 of the roadmap when ready.
