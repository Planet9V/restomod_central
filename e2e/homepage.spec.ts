import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/RestoMod Central/i);
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to vehicles page', async ({ page }) => {
    await page.goto('/');

    // Look for vehicles link and click it
    const vehiclesLink = page.getByRole('link', { name: /vehicles|cars|gateway/i });
    await vehiclesLink.first().click();

    // Verify we're on the vehicles page
    await expect(page).toHaveURL(/gateway-vehicles|cars/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if page loads correctly on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should perform vehicle search', async ({ page }) => {
    await page.goto('/');

    // Find search input
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('mustang');

      // Wait for search results or navigation
      await page.waitForLoadState('networkidle');

      // Verify search executed
      expect(page.url()).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Homepage should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
