import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class VinDecoderPage extends BasePage {
  readonly vinInput: Locator;
  readonly decodeButton: Locator;
  readonly makeField: Locator;
  readonly modelField: Locator;
  readonly yearField: Locator;
  readonly engineField: Locator;
  readonly transmissionField: Locator;
  readonly bodyTypeField: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;
  readonly successIndicator: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    super(page);

    // VIN input and controls
    this.vinInput = page.getByLabel(/VIN/i).or(
      page.getByPlaceholder(/enter.*VIN|17.*character/i)
    );
    this.decodeButton = page.getByRole('button', { name: /decode|verify|check/i });
    this.clearButton = page.getByRole('button', { name: /clear|reset/i });

    // Auto-filled fields
    this.makeField = page.locator('#make').or(page.getByLabel(/make/i));
    this.modelField = page.locator('#model').or(page.getByLabel(/model/i));
    this.yearField = page.locator('#year').or(page.getByLabel(/year/i));
    this.engineField = page.locator('#engine').or(page.getByLabel(/engine/i));
    this.transmissionField = page.locator('#transmission').or(page.getByLabel(/transmission/i));
    this.bodyTypeField = page.locator('#bodyType').or(page.getByLabel(/body.*type/i));

    // Feedback
    this.errorMessage = page.locator('[role="alert"]').or(
      page.locator('text=/invalid.*VIN|error/i')
    );
    this.loadingIndicator = page.locator('text=/decoding|loading/i').or(
      page.locator('.animate-spin')
    );
    this.successIndicator = page.locator('text=/success|decoded|verified/i');
  }

  async gotoVinPage() {
    // VIN decoder might be on admin page or a specific form
    await this.goto('/admin');
    await this.waitForLoadState();
  }

  async enterVin(vin: string) {
    await this.vinInput.fill(vin);
  }

  async decodeVin() {
    await this.decodeButton.click();
    await this.waitForDecoding();
  }

  async waitForDecoding(timeout: number = 10000) {
    // Wait for loading to start
    await this.loadingIndicator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

    // Wait for loading to finish
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
  }

  async enterAndDecodeVin(vin: string) {
    await this.enterVin(vin);
    await this.decodeVin();
  }

  async getDecodedData() {
    const make = await this.makeField.inputValue();
    const model = await this.modelField.inputValue();
    const year = await this.yearField.inputValue();

    return { make, model, year };
  }

  async verifyFieldsAutoFilled() {
    await expect(this.makeField).not.toHaveValue('');
    await expect(this.modelField).not.toHaveValue('');
    await expect(this.yearField).not.toHaveValue('');
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  async hasSuccess(): Promise<boolean> {
    return await this.successIndicator.isVisible();
  }

  async clearForm() {
    if (await this.clearButton.isVisible()) {
      await this.clearButton.click();
    } else {
      await this.vinInput.clear();
    }
  }

  async testVinWithSpaces(vin: string) {
    // Enter VIN with spaces
    const vinWithSpaces = vin.replace(/(.{4})/g, '$1 ').trim();
    await this.enterVin(vinWithSpaces);

    // Verify spaces are auto-cleaned
    const inputValue = await this.vinInput.inputValue();
    expect(inputValue).toBe(vin.replace(/\s/g, ''));
  }

  async verifyNHTSAData(expectedData: { make?: string; model?: string; year?: string }) {
    const decodedData = await this.getDecodedData();

    if (expectedData.make) {
      expect(decodedData.make.toLowerCase()).toContain(expectedData.make.toLowerCase());
    }

    if (expectedData.model) {
      expect(decodedData.model.toLowerCase()).toContain(expectedData.model.toLowerCase());
    }

    if (expectedData.year) {
      expect(decodedData.year).toBe(expectedData.year);
    }
  }

  async testInvalidVin(invalidVin: string) {
    await this.enterAndDecodeVin(invalidVin);

    // Should show error
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });

    // Fields should not be filled
    const make = await this.makeField.inputValue();
    expect(make).toBe('');
  }

  async testValidVin(validVin: string, expectedMake?: string) {
    await this.enterAndDecodeVin(validVin);

    // Should not show error
    await expect(this.errorMessage).not.toBeVisible();

    // Fields should be filled
    await this.verifyFieldsAutoFilled();

    if (expectedMake) {
      const make = await this.makeField.inputValue();
      expect(make.toLowerCase()).toContain(expectedMake.toLowerCase());
    }
  }
}
