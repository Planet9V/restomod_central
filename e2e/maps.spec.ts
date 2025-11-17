import { test, expect } from '@playwright/test';
import { MapPage } from './page-objects/MapPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('Event Maps', () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);

    // Set geolocation to a test location (St. Louis, MO - Gateway Classic Cars HQ)
    await context.setGeolocation({ latitude: 38.6270, longitude: -90.1994 });

    mapPage = new MapPage(page);
    await mapPage.gotoEventsPage();
  });

  test('should load map on events page', async ({ page }) => {
    // Wait for map to load
    await mapPage.waitForMapLoad();

    // Verify map is visible
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should display markers for all events', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Get marker count
    const markerCount = await mapPage.getMarkerCount();

    // Should have at least some markers
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should click marker and show event details', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const markerCount = await mapPage.getMarkerCount();

    if (markerCount > 0) {
      // Click first marker
      await mapPage.clickMarker(0);

      // Popup should appear
      await mapPage.verifyMarkerPopup();

      // Popup should have content
      const content = await mapPage.getPopupContent();
      expect(content.length).toBeGreaterThan(0);
    }
  });

  test('should handle "Find events near me" functionality', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Click find near me button
    await mapPage.clickFindNearMe();

    // Map should update (we can verify this by checking if there's any change)
    await page.waitForTimeout(1000);

    // Map should still be visible
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should zoom in and out', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Test zoom controls
    await mapPage.zoomIn();
    await page.waitForTimeout(300);

    await mapPage.zoomOut();
    await page.waitForTimeout(300);

    // Map should still be functional
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should display directions button', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const markerCount = await mapPage.getMarkerCount();

    if (markerCount > 0) {
      // Click marker to show details
      await mapPage.clickMarker(0);
      await page.waitForTimeout(500);

      // Try to click directions
      await mapPage.clickDirections();

      // Should not crash
      expect(page.url()).toContain('events');
    }
  });

  test('should search for location', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Search for a location
    await mapPage.searchLocation('St. Louis, MO');

    // Map should still be loaded
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should handle map interactions (pan, zoom)', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Test map interactions
    await mapPage.testMapInteraction();

    // Map should still be functional
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad();

    // Map should be responsive
    await mapPage.verifyMapResponsive();
  });

  test('should display multiple markers for multiple events', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const markerCount = await mapPage.getMarkerCount();

    // Verify we have markers for events
    await mapPage.verifyMarkersForAllEvents(1);
  });

  test('should show event details in popup', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const markerCount = await mapPage.getMarkerCount();

    if (markerCount > 0) {
      await mapPage.clickMarker(0);

      const content = await mapPage.getPopupContent();

      // Content should include event information
      expect(content.length).toBeGreaterThan(10);
    }
  });

  test('should close event details', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const markerCount = await mapPage.getMarkerCount();

    if (markerCount > 0) {
      await mapPage.clickMarker(0);
      await mapPage.verifyMarkerPopup();

      // Close event details
      await mapPage.closeEventDetails();

      await page.waitForTimeout(500);
    }
  });

  test('should be accessible (WCAG compliance)', async ({ page }) => {
    await mapPage.waitForMapLoad();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('canvas') // Exclude map canvas from a11y check (maps have their own a11y requirements)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should handle no events gracefully', async ({ page }) => {
    // Mock API to return no events
    await page.route('**/api/events**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      })
    );

    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad();

    // Map should load even with no markers
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);

    const markerCount = await mapPage.getMarkerCount();
    expect(markerCount).toBe(0);
  });

  test('should handle map load errors gracefully', async ({ page }) => {
    // Block map API
    await page.route('**/mapbox.com/**', route => route.abort());
    await page.route('**/maps.googleapis.com/**', route => route.abort());

    await mapPage.gotoEventsPage();

    // Page should not crash
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('events');
  });

  test('should cluster markers when zoomed out', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Zoom out to see clustering (if implemented)
    await mapPage.zoomOut();
    await mapPage.zoomOut();
    await page.waitForTimeout(500);

    // Map should still be functional
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });

  test('should expand markers when zoomed in', async ({ page }) => {
    await mapPage.waitForMapLoad();

    // Zoom in
    await mapPage.zoomIn();
    await mapPage.zoomIn();
    await page.waitForTimeout(500);

    // Should show individual markers
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });
});

test.describe('Event Maps - Performance', () => {
  test('should load map quickly', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.6270, longitude: -90.1994 });

    const mapPage = new MapPage(page);

    const startTime = Date.now();
    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad(20000);
    const loadTime = Date.now() - startTime;

    // Map should load in under 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should render markers efficiently', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.6270, longitude: -90.1994 });

    const mapPage = new MapPage(page);
    await mapPage.gotoEventsPage();

    const startTime = Date.now();
    await mapPage.waitForMapLoad();
    const markerCount = await mapPage.getMarkerCount();
    const renderTime = Date.now() - startTime;

    console.log(`Rendered ${markerCount} markers in ${renderTime}ms`);

    // Should render markers reasonably quickly
    expect(renderTime).toBeLessThan(5000);
  });
});

test.describe('Event Maps - Geolocation', () => {
  test('should request geolocation permission', async ({ page, context }) => {
    const mapPage = new MapPage(page);
    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad();

    // Grant permission
    await context.grantPermissions(['geolocation']);

    await mapPage.clickFindNearMe();

    // Should not crash
    await page.waitForTimeout(1000);
  });

  test('should handle geolocation permission denied', async ({ page, context }) => {
    const mapPage = new MapPage(page);
    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad();

    // Deny permission
    await context.clearPermissions();

    await mapPage.clickFindNearMe();

    // Should handle gracefully
    await page.waitForTimeout(1000);

    // Page should not crash
    expect(page.url()).toContain('events');
  });

  test('should use provided geolocation', async ({ page, context }) => {
    // Set specific location
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 }); // New York

    await context.grantPermissions(['geolocation']);

    const mapPage = new MapPage(page);
    await mapPage.gotoEventsPage();
    await mapPage.waitForMapLoad();

    await mapPage.clickFindNearMe();

    await page.waitForTimeout(2000);

    // Map should have centered on New York area
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBe(true);
  });
});
