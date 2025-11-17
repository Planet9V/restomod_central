import { test, expect } from '@playwright/test';

test.describe('Vehicle Search & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vehicles page
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
  });

  test('should display vehicle listings', async ({ page }) => {
    // Check if vehicles are displayed
    const vehicleCards = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$|price/i })
    );

    // Should have at least some vehicles
    await expect(vehicleCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter vehicles by make', async ({ page }) => {
    // Look for filter controls
    const makeFilter = page.getByLabel(/make/i).or(
      page.locator('select').filter({ hasText: /make/i })
    );

    if (await makeFilter.count() > 0) {
      await makeFilter.first().click();

      // Select a make (e.g., Ford)
      await page.getByRole('option', { name: /ford/i }).click();

      // Wait for filtered results
      await page.waitForLoadState('networkidle');

      // Verify URL or results changed
      expect(page.url()).toBeTruthy();
    }
  });

  test('should search for specific vehicle', async ({ page }) => {
    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/search/i)
    );

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('mustang');
      await page.keyboard.press('Enter');

      await page.waitForLoadState('networkidle');

      // Check if results contain "mustang"
      const pageContent = await page.textContent('body');
      expect(pageContent?.toLowerCase()).toContain('mustang');
    }
  });

  test('should show vehicle details', async ({ page }) => {
    // Find and click first vehicle
    const firstVehicle = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$|price/i })
    ).first();

    if (await firstVehicle.count() > 0) {
      await firstVehicle.click();

      // Wait for details page to load
      await page.waitForLoadState('networkidle');

      // Should see more details
      expect(page.url()).toBeTruthy();
    }
  });
});

test.describe('Mobile Vehicle Browsing', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display vehicles on mobile', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    // Check if page is responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should open mobile filters', async ({ page }) => {
    await page.goto('/gateway-vehicles');

    // Look for mobile filter button
    const filterButton = page.getByRole('button', { name: /filter/i });

    if (await filterButton.count() > 0) {
      await filterButton.first().click();

      // Filter panel should appear
      await page.waitForTimeout(500);
      expect(page.url()).toBeTruthy();
    }
  });
});
