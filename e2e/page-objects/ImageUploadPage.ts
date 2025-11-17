import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import * as path from 'path';

export class ImageUploadPage extends BasePage {
  readonly uploadZone: Locator;
  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly progressBar: Locator;
  readonly previewImage: Locator;
  readonly uploadedImages: Locator;
  readonly deleteButton: Locator;
  readonly cloudinaryUrl: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Upload zone selectors
    this.uploadZone = page.locator('[class*="dropzone"]').or(
      page.locator('text=/drag.*drop|upload/i').locator('..')
    );
    this.fileInput = page.locator('input[type="file"]');
    this.uploadButton = page.getByRole('button', { name: /upload/i });

    // Progress and feedback
    this.progressBar = page.locator('[role="progressbar"]').or(
      page.locator('.progress')
    );
    this.previewImage = page.locator('[alt*="preview"]').or(
      page.locator('img[src*="blob:"]')
    );
    this.uploadedImages = page.locator('img[src*="cloudinary"]').or(
      page.locator('img[src*="res.cloudinary.com"]')
    );

    // Actions
    this.deleteButton = page.getByRole('button', { name: /delete|remove/i });
    this.cloudinaryUrl = page.locator('input[value*="cloudinary"]').or(
      page.locator('text=/res\\.cloudinary\\.com/i')
    );

    // Messages
    this.errorMessage = page.locator('[role="alert"]').or(
      page.locator('text=/error|failed/i')
    );
    this.successMessage = page.locator('text=/success|uploaded/i');
  }

  async gotoUploadPage() {
    await this.goto('/vehicle-archive'); // or wherever upload is available
    await this.waitForLoadState();
  }

  async uploadImage(filename: string) {
    const filePath = path.join(__dirname, '../fixtures', filename);
    await this.fileInput.setInputFiles(filePath);

    // Wait for upload to complete
    await this.waitForUploadComplete();
  }

  async uploadImageViaDropZone(filename: string) {
    const filePath = path.join(__dirname, '../fixtures', filename);

    // Simulate drag and drop
    const dataTransfer = await this.page.evaluateHandle((file) => {
      const dt = new DataTransfer();
      const blob = new File([new Blob()], file, { type: 'image/jpeg' });
      dt.items.add(blob);
      return dt;
    }, filename);

    await this.uploadZone.dispatchEvent('drop', { dataTransfer });
    await this.waitForUploadComplete();
  }

  async waitForUploadComplete(timeout: number = 30000) {
    // Wait for progress bar to appear
    await this.progressBar.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

    // Wait for progress bar to disappear (upload complete)
    await this.progressBar.waitFor({ state: 'hidden', timeout });
  }

  async hasPreview(): Promise<boolean> {
    return await this.previewImage.isVisible();
  }

  async hasUploadedImage(): Promise<boolean> {
    return await this.uploadedImages.first().isVisible();
  }

  async getCloudinaryUrl(): Promise<string> {
    if (await this.cloudinaryUrl.isVisible()) {
      return await this.cloudinaryUrl.inputValue() || '';
    }

    // Try to get from img src
    const imgSrc = await this.uploadedImages.first().getAttribute('src');
    return imgSrc || '';
  }

  async verifyCloudinaryUrl(url: string) {
    expect(url).toContain('cloudinary.com');
    expect(url).toContain('res.cloudinary.com');
  }

  async deleteUploadedImage(index: number = 0) {
    const deleteButtons = await this.deleteButton.all();
    if (deleteButtons.length > index) {
      await deleteButtons[index].click();
      await this.waitForTimeout(500);
    }
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async hasSuccess(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  async uploadMultipleImages(filenames: string[]) {
    const filePaths = filenames.map(f => path.join(__dirname, '../fixtures', f));
    await this.fileInput.setInputFiles(filePaths);
    await this.waitForUploadComplete();
  }

  async getUploadedImageCount(): Promise<number> {
    return await this.uploadedImages.count();
  }

  async verifyImageOptimization(url: string) {
    // Verify Cloudinary transformations are applied
    expect(url).toMatch(/\/upload\/(q_auto|f_auto|w_\d+)/);
  }
}
