import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MapPage extends BasePage {
  readonly mapContainer: Locator;
  readonly mapMarkers: Locator;
  readonly eventDetails: Locator;
  readonly findNearMeButton: Locator;
  readonly directionsButton: Locator;
  readonly searchInput: Locator;
  readonly loadingOverlay: Locator;
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
  readonly markerPopup: Locator;

  constructor(page: Page) {
    super(page);

    // Map container
    this.mapContainer = page.locator('#map').or(
      page.locator('[class*="mapbox"]')
    ).or(
      page.locator('canvas').first()
    );

    // Map elements
    this.mapMarkers = page.locator('[class*="marker"]').or(
      page.locator('img[src*="marker"]')
    );

    // Controls
    this.findNearMeButton = page.getByRole('button', { name: /near.*me|my.*location/i });
    this.directionsButton = page.getByRole('button', { name: /directions|route/i });
    this.searchInput = page.getByPlaceholder(/search.*location|address/i);
    this.zoomInButton = page.locator('button[aria-label*="Zoom in"]');
    this.zoomOutButton = page.locator('button[aria-label*="Zoom out"]');

    // Event details
    this.eventDetails = page.locator('[class*="event-details"]').or(
      page.locator('[role="dialog"]')
    );
    this.markerPopup = page.locator('[class*="mapboxgl-popup"]').or(
      page.locator('.popup')
    );

    // Loading
    this.loadingOverlay = page.locator('text=/loading.*map/i');
  }

  async gotoEventsPage() {
    // Navigate to events page with map
    await this.goto('/events');
    await this.waitForLoadState();
  }

  async waitForMapLoad(timeout: number = 15000) {
    // Wait for map container to be visible
    await this.mapContainer.waitFor({ state: 'visible', timeout });

    // Wait for loading overlay to disappear
    await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    // Give map time to render
    await this.waitForTimeout(2000);
  }

  async isMapLoaded(): Promise<boolean> {
    return await this.mapContainer.isVisible();
  }

  async getMarkerCount(): Promise<number> {
    await this.waitForTimeout(1000); // Wait for markers to render
    return await this.mapMarkers.count();
  }

  async clickMarker(index: number = 0) {
    const markers = await this.mapMarkers.all();

    if (markers.length > index) {
      await markers[index].click();
      await this.waitForTimeout(500);
    }
  }

  async verifyMarkerPopup() {
    await expect(this.markerPopup).toBeVisible({ timeout: 3000 });
  }

  async getPopupContent(): Promise<string> {
    return await this.markerPopup.textContent() || '';
  }

  async clickFindNearMe() {
    await this.findNearMeButton.click();

    // Mock geolocation permission
    await this.page.context().grantPermissions(['geolocation']);

    await this.waitForTimeout(1000);
  }

  async searchLocation(location: string) {
    await this.searchInput.fill(location);
    await this.page.keyboard.press('Enter');
    await this.waitForTimeout(1000);
  }

  async zoomIn() {
    await this.zoomInButton.click();
    await this.waitForTimeout(300);
  }

  async zoomOut() {
    await this.zoomOutButton.click();
    await this.waitForTimeout(300);
  }

  async clickDirections() {
    if (await this.directionsButton.isVisible()) {
      await this.directionsButton.click();
      await this.waitForTimeout(500);
    }
  }

  async verifyEventDetailsDisplay() {
    await expect(this.eventDetails).toBeVisible({ timeout: 3000 });
  }

  async closeEventDetails() {
    const closeButton = this.eventDetails.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async verifyMarkersForAllEvents(expectedMinCount: number) {
    const count = await this.getMarkerCount();
    expect(count).toBeGreaterThanOrEqual(expectedMinCount);
  }

  async testMapInteraction() {
    // Test basic map interactions
    await this.zoomIn();
    await this.zoomOut();

    // Pan the map
    const mapBox = await this.mapContainer.boundingBox();
    if (mapBox) {
      await this.page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(mapBox.x + mapBox.width / 2 + 100, mapBox.y + mapBox.height / 2);
      await this.page.mouse.up();
    }

    await this.waitForTimeout(500);
  }

  async verifyMapResponsive() {
    // Check map adjusts to viewport
    const box = await this.mapContainer.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  }
}
