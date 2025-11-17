import { test, expect } from '@playwright/test';
import { SearchPage } from './page-objects/SearchPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('Vehicle Search & Filters', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.gotoSearchPage();
  });

  test('should display vehicle listings', async ({ page }) => {
    // Wait for vehicles to load
    await searchPage.waitForResults();

    // Should have vehicles displayed
    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search by make/model', async ({ page }) => {
    // Search for specific make
    await searchPage.search('Ford');
    await searchPage.waitForResults();

    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThan(0);

    // Verify results contain search term
    const firstVehicle = await searchPage.getVehicleDetails(0);
    expect(firstVehicle.title?.toLowerCase()).toContain('ford');
  });

  test('should search by year', async ({ page }) => {
    // Search for specific year
    await searchPage.search('1967');
    await searchPage.waitForResults();

    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThan(0);

    // Verify results contain year
    const firstVehicle = await searchPage.getVehicleDetails(0);
    expect(firstVehicle.title).toContain('1967');
  });

  test('should filter by make using dropdown', async ({ page }) => {
    // Initial count
    const initialCount = await searchPage.getVehicleCount();

    // Apply make filter
    await searchPage.filterByMake('Ford');
    await searchPage.waitForResults();

    // Results should be filtered
    const filteredCount = await searchPage.getVehicleCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All results should be Ford
    if (filteredCount > 0) {
      const vehicle = await searchPage.getVehicleDetails(0);
      expect(vehicle.title?.toLowerCase()).toContain('ford');
    }
  });

  test('should filter by category', async ({ page }) => {
    // Apply category filter
    await searchPage.filterByCategory('muscle');
    await searchPage.waitForResults();

    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter featured vehicles only', async ({ page }) => {
    // Get initial count
    const allCount = await searchPage.getVehicleCount();

    // Toggle featured only
    await searchPage.toggleFeaturedOnly();
    await searchPage.waitForResults();

    const featuredCount = await searchPage.getVehicleCount();

    // Featured count should be less than or equal to all
    expect(featuredCount).toBeLessThanOrEqual(allCount);
  });

  test('should combine multiple filters', async ({ page }) => {
    // Apply multiple filters
    await searchPage.filterByMake('Ford');
    await searchPage.toggleFeaturedOnly();
    await searchPage.waitForResults();

    const count = await searchPage.getVehicleCount();

    // Should return filtered results
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should update results count display', async ({ page }) => {
    // Get results count text
    const countText = await searchPage.getResultsCountText();

    // Should display count in format "X of Y vehicles"
    expect(countText).toMatch(/\d+.*of.*\d+.*vehicles?/i);
  });

  test('should show no results message when appropriate', async ({ page }) => {
    // Search for something that definitely won't exist
    await searchPage.search('NONEXISTENTVEHICLEXYZ123');
    await searchPage.waitForResults();

    // Should show no results message
    const hasNoResults = await searchPage.hasNoResults();
    expect(hasNoResults).toBe(true);
  });

  test('should clear search and show all results', async ({ page }) => {
    // Search for something specific
    await searchPage.search('Mustang');
    await searchPage.waitForResults();

    const searchCount = await searchPage.getVehicleCount();

    // Clear search
    await searchPage.clearSearch();
    await searchPage.waitForResults();

    const allCount = await searchPage.getVehicleCount();

    // All count should be greater than or equal to search count
    expect(allCount).toBeGreaterThanOrEqual(searchCount);
  });

  test('should click vehicle and navigate to detail page', async ({ page }) => {
    await searchPage.waitForResults();

    // Get URL before click
    const initialUrl = page.url();

    // Click first vehicle
    await searchPage.clickFirstVehicle();

    // URL should change
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
  });

  test('should display vehicle price', async ({ page }) => {
    await searchPage.waitForResults();

    const vehicle = await searchPage.getVehicleDetails(0);

    // Price should be formatted correctly
    expect(vehicle.price).toMatch(/\$[\d,]+/);
  });

  test('should be accessible (WCAG compliance)', async ({ page }) => {
    await searchPage.waitForResults();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await searchPage.gotoSearchPage();
    await searchPage.waitForResults();

    // Should display vehicles
    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThan(0);

    // Search should work
    await searchPage.search('Ford');
    await searchPage.waitForResults();
  });

  test('should handle special characters in search', async ({ page }) => {
    // Test special characters don't break search
    await searchPage.search('F-150');
    await searchPage.waitForResults();

    // Should not crash
    expect(page.url()).toContain('gateway-vehicles');
  });

  test('should persist filters in URL', async ({ page }) => {
    // Apply filter
    await searchPage.filterByMake('Ford');
    await searchPage.waitForResults();

    // URL should include filter
    const url = page.url();
    expect(url).toContain('make=Ford');
  });

  test('should handle rapid filter changes', async ({ page }) => {
    // Rapidly change filters
    await searchPage.filterByMake('Ford');
    await page.waitForTimeout(100);
    await searchPage.filterByMake('Chevrolet');
    await page.waitForTimeout(100);
    await searchPage.filterByMake('Dodge');

    await searchPage.waitForResults();

    // Should show Dodge results
    const count = await searchPage.getVehicleCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Vehicle Search - Performance', () => {
  test('should load search results quickly', async ({ page }) => {
    const searchPage = new SearchPage(page);

    const startTime = Date.now();
    await searchPage.gotoSearchPage();
    await searchPage.waitForResults();
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should filter results quickly', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.gotoSearchPage();
    await searchPage.waitForResults();

    const startTime = Date.now();
    await searchPage.filterByMake('Ford');
    await searchPage.waitForResults();
    const filterTime = Date.now() - startTime;

    // Filtering should be fast (under 1 second)
    expect(filterTime).toBeLessThan(1000);
  });
});

test.describe('Vehicle Search - Pagination', () => {
  test('should navigate to next page', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.gotoSearchPage();
    await searchPage.waitForResults();

    // Get first vehicle on page 1
    const page1Vehicle = await searchPage.getVehicleDetails(0);

    // Go to next page
    await searchPage.goToNextPage();

    // Get first vehicle on page 2
    const page2Vehicle = await searchPage.getVehicleDetails(0);

    // Vehicles should be different
    expect(page1Vehicle.title).not.toBe(page2Vehicle.title);
  });

  test('should navigate to previous page', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.gotoSearchPage();
    await searchPage.waitForResults();

    // Go to page 2
    await searchPage.goToNextPage();
    const page2Vehicle = await searchPage.getVehicleDetails(0);

    // Go back to page 1
    await searchPage.goToPreviousPage();
    const page1Vehicle = await searchPage.getVehicleDetails(0);

    // Vehicles should be different
    expect(page1Vehicle.title).not.toBe(page2Vehicle.title);
  });
});
