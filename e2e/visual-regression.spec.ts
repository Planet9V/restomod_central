import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Configure test to use consistent viewport for visual tests
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should match homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await page.waitForTimeout(1000);

    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences
    });
  });

  test('should match car detail page screenshot', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    // Click first vehicle
    const firstVehicle = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$/i })
    ).first();

    if (await firstVehicle.isVisible()) {
      await firstVehicle.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('car-detail.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    }
  });

  test('should match event map screenshot', async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.6270, longitude: -90.1994 });

    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Wait for map to load
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('event-map.png', {
      fullPage: true,
      maxDiffPixels: 200, // Maps can have slight rendering differences
    });
  });

  test('should match vehicle search page screenshot', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('vehicle-search.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('should match navigation menu screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of navigation only
    const nav = page.locator('nav').first();
    await expect(nav).toHaveScreenshot('navigation.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match footer screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(footer).toHaveScreenshot('footer.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match vehicle card component', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    // Screenshot individual vehicle card
    const firstCard = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$/i })
    ).first();

    if (await firstCard.isVisible()) {
      await expect(firstCard).toHaveScreenshot('vehicle-card.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('should match configurator page', async ({ page }) => {
    await page.goto('/ai-configurator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('configurator.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });
});

test.describe('Visual Regression - Dark Theme', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark',
  });

  test('should match homepage in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });

  test('should match search page in dark mode', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('search-dark.png', {
      fullPage: true,
      maxDiffPixels: 150,
    });
  });
});

test.describe('Visual Regression - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should match homepage on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('should match navigation menu on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open mobile menu if there's a hamburger button
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('mobile-menu.png', {
        maxDiffPixels: 50,
      });
    }
  });

  test('should match search page on mobile', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('search-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('should match vehicle card on mobile', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$/i })
    ).first();

    if (await firstCard.isVisible()) {
      await expect(firstCard).toHaveScreenshot('vehicle-card-mobile.png', {
        maxDiffPixels: 50,
      });
    }
  });
});

test.describe('Visual Regression - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should match homepage on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('should match search page on tablet', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('search-tablet.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Component States', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should match button hover state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstButton = page.getByRole('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.hover();
      await page.waitForTimeout(300);

      await expect(firstButton).toHaveScreenshot('button-hover.png', {
        maxDiffPixels: 20,
      });
    }
  });

  test('should match form validation error state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find a form and trigger validation
    const emailInput = page.getByPlaceholder(/email/i).first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(500);

      await expect(emailInput.locator('..')).toHaveScreenshot('form-error.png', {
        maxDiffPixels: 30,
      });
    }
  });

  test('should match loading state', async ({ page }) => {
    // Delay network to show loading state
    await page.route('**/api/**', route =>
      new Promise(resolve => setTimeout(() => resolve(route.continue()), 2000))
    );

    await page.goto('/gateway-vehicles');

    // Wait for loading indicator
    await page.waitForTimeout(500);

    const loadingIndicator = page.locator('.animate-spin').or(
      page.locator('text=/loading/i')
    ).first();

    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toHaveScreenshot('loading-state.png', {
        maxDiffPixels: 30,
      });
    }
  });
});

test.describe('Visual Regression - Cross-browser', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take browser-specific screenshot
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      maxDiffPixels: 200, // Allow for browser rendering differences
    });
  });
});

test.describe('Visual Regression - Performance Metrics', () => {
  test('should capture Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`LCP: ${lcp}ms`);

    // LCP should be under 2.5 seconds (good)
    expect(lcp).toBeLessThan(2500);
  });

  test('should capture First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });

    console.log(`FCP: ${fcp}ms`);

    // FCP should be under 1.8 seconds (good)
    expect(fcp).toBeLessThan(1800);
  });

  test('should capture Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for page to settle
    await page.waitForTimeout(2000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsValue += (entry as any).value;
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    console.log(`CLS: ${cls}`);

    // CLS should be under 0.1 (good)
    expect(cls).toBeLessThan(0.1);
  });
});
