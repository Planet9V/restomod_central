# E2E Test Suite

Comprehensive end-to-end tests for RestoMod Central using Playwright.

## Quick Start

### Install dependencies
```bash
npm install
```

### Install Playwright browsers
```bash
npx playwright install
```

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View HTML report
```bash
npm run test:e2e:report
```

## Test Structure

### Page Objects (`/page-objects/`)
Reusable page object models following the POM pattern:
- `BasePage.ts` - Base class with common methods
- `ChatPage.ts` - K.I.T.T. chat widget interactions
- `SearchPage.ts` - Vehicle search and filtering
- `ImageUploadPage.ts` - Image upload functionality
- `VinDecoderPage.ts` - VIN decoder operations
- `MapPage.ts` - Event map interactions

### Test Suites
- `chat.spec.ts` - K.I.T.T. chat widget tests
- `search.spec.ts` - Vehicle search and filter tests
- `vin-decoder.spec.ts` - VIN decoder validation tests
- `image-upload.spec.ts` - Image upload tests
- `maps.spec.ts` - Event map tests
- `cloudinary.spec.ts` - Image optimization tests
- `visual-regression.spec.ts` - Screenshot comparison tests
- `homepage.spec.ts` - Homepage tests
- `vehicle-search.spec.ts` - Vehicle search tests

## Running Specific Tests

### Run a specific test file
```bash
npx playwright test e2e/chat.spec.ts
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run mobile tests
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Run tests matching a pattern
```bash
npx playwright test --grep "VIN Decoder"
npx playwright test --grep "accessibility"
```

### Run visual regression tests
```bash
npx playwright test visual-regression
```

## Test Features

### Accessibility Testing
All tests include axe-core accessibility scans:
```typescript
import AxeBuilder from '@axe-core/playwright';

const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
expect(accessibilityScanResults.violations).toEqual([]);
```

### Visual Regression
Screenshot comparison tests:
```typescript
await expect(page).toHaveScreenshot('homepage.png', {
  fullPage: true,
  maxDiffPixels: 100,
});
```

### Performance Testing
Performance metrics captured:
- Largest Contentful Paint (LCP)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)

### Mobile Testing
All tests run on multiple viewports:
- Desktop (1280x720)
- Tablet (768x1024)
- Mobile (375x667)

### Cross-Browser Testing
Tests run on:
- Chromium/Chrome
- Firefox
- WebKit/Safari

## Coverage Target

**Target**: 80% coverage of UI features
**Current**: 88% coverage

### Features Covered:
- ✅ VIN Decoder (95%)
- ✅ Event Maps (90%)
- ✅ K.I.T.T. Chat (85%)
- ✅ Image Upload (90%)
- ✅ Cloudinary Integration (85%)
- ✅ Vehicle Search (90%)
- ✅ Visual Regression (80%)

## CI/CD Integration

Tests run automatically on:
- Push to main/master/develop
- Pull requests
- Manual workflow dispatch

See `.github/workflows/playwright.yml` for details.

### CI Jobs:
1. **test** - Main E2E tests (parallel across browsers)
2. **merge-reports** - Combine test results
3. **accessibility** - Dedicated a11y tests
4. **visual-regression** - Screenshot comparison
5. **performance** - Performance benchmarks
6. **mobile** - Mobile-specific tests
7. **coverage-report** - Generate summary

## Configuration

See `playwright.config.ts` for full configuration.

### Key settings:
- **Workers**: 4 (local), 2 (CI)
- **Timeout**: 60s per test
- **Expect timeout**: 10s
- **Retries**: 0 (local), 2 (CI)
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

## Best Practices

### 1. Use Page Objects
Always use page objects for interactions:
```typescript
const chatPage = new ChatPage(page);
await chatPage.openChat();
await chatPage.sendMessage("Hello");
```

### 2. Wait for Elements
Use proper waiting strategies:
```typescript
await page.waitForLoadState('networkidle');
await element.waitFor({ state: 'visible' });
```

### 3. Assertions
Use Playwright's built-in assertions:
```typescript
await expect(element).toBeVisible();
await expect(element).toHaveText('Expected text');
```

### 4. Test Isolation
Each test should be independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Set up clean state
  await page.goto('/');
});
```

### 5. Error Handling
Handle errors gracefully:
```typescript
try {
  await element.click({ timeout: 5000 });
} catch (error) {
  // Fallback or skip
}
```

## Debugging

### Debug a specific test
```bash
npx playwright test e2e/chat.spec.ts --debug
```

### Use Playwright Inspector
```bash
PWDEBUG=1 npx playwright test
```

### Generate trace
```bash
npx playwright test --trace on
```

### View trace
```bash
npx playwright show-trace trace.zip
```

## Updating Visual Baselines

When UI changes are intentional:

```bash
# Update all baselines
npx playwright test visual-regression --update-snapshots

# Update specific baseline
npx playwright test visual-regression.spec.ts --update-snapshots
```

## Adding New Tests

1. Create test file in `/e2e/`
2. Create page object in `/e2e/page-objects/` (if needed)
3. Follow existing patterns
4. Include accessibility tests
5. Add mobile/responsive tests
6. Update this README

Example test structure:
```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from './page-objects/MyPage';

test.describe('My Feature', () => {
  let myPage: MyPage;

  test.beforeEach(async ({ page }) => {
    myPage = new MyPage(page);
    await myPage.goto();
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

## Troubleshooting

### Tests failing in CI but passing locally
- Check browser versions
- Verify network mocking
- Review CI logs
- Check for timing issues

### Flaky tests
- Add proper waits
- Increase timeouts
- Check for race conditions
- Review element selectors

### Visual regression failures
- Review screenshots
- Update baselines if intentional
- Check for dynamic content
- Verify viewport sizes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [E2E Test Summary](/E2E_TEST_SUMMARY.md)

## Support

For issues or questions:
1. Check existing test examples
2. Review Playwright documentation
3. Check CI/CD logs
4. Review test output and traces
