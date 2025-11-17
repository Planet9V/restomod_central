import { test, expect } from '@playwright/test';
import { VinDecoderPage } from './page-objects/VinDecoderPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('VIN Decoder', () => {
  let vinPage: VinDecoderPage;

  // Valid VIN examples for testing
  const VALID_VINS = {
    ford: '1FAHP3F23CL123456', // 2012 Ford Fusion (example)
    chevy: '1G1ZD5ST0HF123456', // 2017 Chevy Malibu (example)
    dodge: '2C3CDXBG8EH123456', // 2014 Dodge Charger (example)
  };

  const INVALID_VINS = [
    'INVALID123',
    '12345',
    'AAAAAAAAAAAAAAAAA',
    'I0OQ123456789123', // Invalid characters (I, O, Q not allowed in VIN)
  ];

  test.beforeEach(async ({ page }) => {
    vinPage = new VinDecoderPage(page);
    await vinPage.gotoVinPage();
  });

  test('should enter valid VIN and auto-fill form', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    // Verify fields are auto-filled
    await vinPage.verifyFieldsAutoFilled();

    // Verify no errors
    const hasError = await vinPage.hasError();
    expect(hasError).toBe(false);
  });

  test('should show error for invalid VIN', async ({ page }) => {
    await vinPage.testInvalidVin(INVALID_VINS[0]);

    // Error message should be displayed
    const errorMessage = await vinPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/invalid|error/i);
  });

  test('should show error for too short VIN', async ({ page }) => {
    await vinPage.testInvalidVin(INVALID_VINS[1]);

    const hasError = await vinPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should auto-clean VIN with spaces', async ({ page }) => {
    const vinWithoutSpaces = VALID_VINS.ford;
    await vinPage.testVinWithSpaces(vinWithoutSpaces);
  });

  test('should auto-clean VIN with dashes', async ({ page }) => {
    const vinWithDashes = '1FA-HP3F-23CL-12345-6';
    await vinPage.enterVin(vinWithDashes);

    // VIN should be cleaned (dashes removed)
    const inputValue = await vinPage.vinInput.inputValue();
    expect(inputValue).not.toContain('-');
    expect(inputValue.length).toBe(17);
  });

  test('should verify NHTSA data displays correctly for Ford', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    // Verify NHTSA data
    await vinPage.verifyNHTSAData({
      make: 'Ford',
    });
  });

  test('should verify NHTSA data displays correctly for Chevrolet', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.chevy);

    await vinPage.verifyNHTSAData({
      make: 'Chevrolet',
    });
  });

  test('should decode VIN and populate all fields', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    const data = await vinPage.getDecodedData();

    // Verify all fields are populated
    expect(data.make).toBeTruthy();
    expect(data.model).toBeTruthy();
    expect(data.year).toBeTruthy();
  });

  test('should show loading indicator while decoding', async ({ page }) => {
    await vinPage.enterVin(VALID_VINS.ford);
    await vinPage.decodeButton.click();

    // Loading indicator should appear
    await expect(vinPage.loadingIndicator).toBeVisible({ timeout: 1000 });

    // Wait for decoding to complete
    await vinPage.waitForDecoding();

    // Loading indicator should disappear
    await expect(vinPage.loadingIndicator).not.toBeVisible();
  });

  test('should clear form', async ({ page }) => {
    // Fill in VIN and decode
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    // Clear form
    await vinPage.clearForm();

    // VIN input should be empty
    const vinValue = await vinPage.vinInput.inputValue();
    expect(vinValue).toBe('');
  });

  test('should handle VIN with lowercase letters', async ({ page }) => {
    const lowercaseVin = VALID_VINS.ford.toLowerCase();
    await vinPage.enterAndDecodeVin(lowercaseVin);

    // Should convert to uppercase and decode successfully
    const inputValue = await vinPage.vinInput.inputValue();
    expect(inputValue).toBe(VALID_VINS.ford.toUpperCase());

    await vinPage.verifyFieldsAutoFilled();
  });

  test('should reject VIN with invalid characters', async ({ page }) => {
    await vinPage.testInvalidVin(INVALID_VINS[3]);

    const hasError = await vinPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should handle consecutive decoding requests', async ({ page }) => {
    // Decode first VIN
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);
    const firstData = await vinPage.getDecodedData();

    // Decode second VIN
    await vinPage.clearForm();
    await vinPage.enterAndDecodeVin(VALID_VINS.chevy);
    const secondData = await vinPage.getDecodedData();

    // Data should be different
    expect(firstData.make).not.toBe(secondData.make);
  });

  test('should be accessible (WCAG compliance)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    // Should work on mobile
    await vinPage.verifyFieldsAutoFilled();
  });

  test('should validate VIN format before submission', async ({ page }) => {
    // Enter incomplete VIN
    await vinPage.enterVin('1FAHP3F23C');

    // Try to decode
    await vinPage.decodeButton.click();

    // Should show error or prevent submission
    await page.waitForTimeout(1000);

    const hasError = await vinPage.hasError();
    const isButtonDisabled = await vinPage.decodeButton.isDisabled();

    expect(hasError || isButtonDisabled).toBe(true);
  });

  test('should show success indicator after successful decode', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    const hasSuccess = await vinPage.hasSuccess();
    expect(hasSuccess).toBe(true);
  });

  test('should populate year field correctly', async ({ page }) => {
    await vinPage.enterAndDecodeVin(VALID_VINS.ford);

    const data = await vinPage.getDecodedData();

    // Year should be a 4-digit number
    expect(data.year).toMatch(/^\d{4}$/);

    const yearNum = parseInt(data.year);
    expect(yearNum).toBeGreaterThan(1980);
    expect(yearNum).toBeLessThan(new Date().getFullYear() + 2);
  });

  test('should handle paste event with spaces', async ({ page }) => {
    // Simulate pasting VIN with spaces
    const vinWithSpaces = '1FA HP3F 23CL 1234 56';

    await vinPage.vinInput.focus();
    await page.evaluate((vin) => {
      const input = document.querySelector('input') as HTMLInputElement;
      if (input) {
        input.value = vin;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, vinWithSpaces);

    await vinPage.decodeButton.click();
    await vinPage.waitForDecoding();

    // Should handle the paste and decode successfully
    const hasError = await vinPage.hasError();
    expect(hasError).toBe(false);
  });
});

test.describe('VIN Decoder - Performance', () => {
  test('should decode VIN quickly', async ({ page }) => {
    const vinPage = new VinDecoderPage(page);
    await vinPage.gotoVinPage();

    await vinPage.enterVin('1FAHP3F23CL123456');

    const startTime = Date.now();
    await vinPage.decodeVin();
    const decodeTime = Date.now() - startTime;

    // Should decode in under 3 seconds
    expect(decodeTime).toBeLessThan(3000);
  });
});

test.describe('VIN Decoder - Edge Cases', () => {
  test('should handle network error gracefully', async ({ page }) => {
    const vinPage = new VinDecoderPage(page);
    await vinPage.gotoVinPage();

    // Simulate network failure
    await page.route('**/api/vin/**', route => route.abort());

    await vinPage.enterAndDecodeVin('1FAHP3F23CL123456');

    // Should show error message
    const hasError = await vinPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should handle API timeout', async ({ page }) => {
    const vinPage = new VinDecoderPage(page);
    await vinPage.gotoVinPage();

    // Simulate slow API
    await page.route('**/api/vin/**', route =>
      new Promise(resolve => setTimeout(() => route.continue(), 10000))
    );

    await vinPage.enterVin('1FAHP3F23CL123456');
    await vinPage.decodeButton.click();

    // Should show loading indicator
    await expect(vinPage.loadingIndicator).toBeVisible();
  });

  test('should handle empty response from API', async ({ page }) => {
    const vinPage = new VinDecoderPage(page);
    await vinPage.gotoVinPage();

    // Mock empty response
    await page.route('**/api/vin/**', route =>
      route.fulfill({ status: 200, body: JSON.stringify({}) })
    );

    await vinPage.enterAndDecodeVin('1FAHP3F23CL123456');

    // Should handle gracefully
    await page.waitForTimeout(1000);
  });
});
