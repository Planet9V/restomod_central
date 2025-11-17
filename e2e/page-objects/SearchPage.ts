import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly makeFilter: Locator;
  readonly categoryFilter: Locator;
  readonly featuredOnlyToggle: Locator;
  readonly vehicleCards: Locator;
  readonly loadingSpinner: Locator;
  readonly noResultsMessage: Locator;
  readonly resultsCount: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);

    // Search and filter selectors
    this.searchInput = page.getByPlaceholder(/search.*vehicles/i);
    this.makeFilter = page.locator('select').filter({ hasText: /make/i }).or(
      page.getByRole('combobox', { name: /make/i })
    );
    this.categoryFilter = page.locator('select').filter({ hasText: /category/i }).or(
      page.getByRole('combobox', { name: /category/i })
    );
    this.featuredOnlyToggle = page.getByRole('button', { name: /featured/i });

    // Results selectors
    this.vehicleCards = page.locator('[data-testid="vehicle-card"]').or(
      page.locator('article').filter({ hasText: /\$/i })
    );
    this.loadingSpinner = page.locator('.animate-spin').or(
      page.locator('text=/loading/i')
    );
    this.noResultsMessage = page.locator('text=/no.*vehicles.*found/i');
    this.resultsCount = page.locator('text=/\\d+.*of.*\\d+.*vehicles/i');

    // Pagination
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous|prev/i });
  }

  async gotoSearchPage() {
    await this.goto('/gateway-vehicles');
    await this.waitForLoadState();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadState();
  }

  async filterByMake(make: string) {
    await this.makeFilter.click();
    await this.page.getByRole('option', { name: new RegExp(make, 'i') }).click();
    await this.waitForLoadState();
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.click();
    await this.page.getByRole('option', { name: new RegExp(category, 'i') }).click();
    await this.waitForLoadState();
  }

  async toggleFeaturedOnly() {
    await this.featuredOnlyToggle.click();
    await this.waitForLoadState();
  }

  async getVehicleCount(): Promise<number> {
    await this.waitForLoadState();
    return await this.vehicleCards.count();
  }

  async clickFirstVehicle() {
    await this.vehicleCards.first().click();
    await this.waitForLoadState();
  }

  async getVehicleDetails(index: number = 0) {
    const card = this.vehicleCards.nth(index);
    const title = await card.locator('h2, h3, [class*="CardTitle"]').first().textContent();
    const price = await card.locator('text=/\\$[\\d,]+/').first().textContent();

    return { title, price };
  }

  async waitForResults() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.waitForTimeout(500);
  }

  async hasResults(): Promise<boolean> {
    const count = await this.getVehicleCount();
    return count > 0;
  }

  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.keyboard.press('Enter');
    await this.waitForLoadState();
  }

  async goToNextPage() {
    if (await this.paginationNext.isEnabled()) {
      await this.paginationNext.click();
      await this.waitForResults();
    }
  }

  async goToPreviousPage() {
    if (await this.paginationPrev.isEnabled()) {
      await this.paginationPrev.click();
      await this.waitForResults();
    }
  }

  async getResultsCountText(): Promise<string> {
    return await this.resultsCount.textContent() || '';
  }

  async searchAndVerify(query: string, expectedMinResults: number = 1) {
    await this.search(query);
    await this.waitForResults();

    const count = await this.getVehicleCount();
    expect(count).toBeGreaterThanOrEqual(expectedMinResults);

    return count;
  }
}
