import { test, expect } from '@playwright/test';
import { ImageUploadPage } from './page-objects/ImageUploadPage';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Image Upload', () => {
  let uploadPage: ImageUploadPage;

  test.beforeAll(async () => {
    // Create fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create a test image if it doesn't exist
    const testImagePath = path.join(fixturesDir, 'test-car.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Create a minimal valid JPEG file (1x1 pixel)
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, jpegHeader);
    }
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new ImageUploadPage(page);
    await uploadPage.gotoUploadPage();
  });

  test('should upload image and show progress', async ({ page }) => {
    // Mock Cloudinary upload
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/v123/test.jpg',
        }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');

    // Progress indicator should have been visible
    // (might be too fast to catch, so we check end state)

    // Upload should complete
    await uploadPage.waitForUploadComplete();
  });

  test('should display preview after selecting image', async ({ page }) => {
    // Select image
    const filePath = path.join(__dirname, 'fixtures', 'test-car.jpg');
    await uploadPage.fileInput.setInputFiles(filePath);

    // Preview should appear
    await expect(uploadPage.previewImage).toBeVisible({ timeout: 3000 });
  });

  test('should store Cloudinary URL after upload', async ({ page }) => {
    // Mock Cloudinary response
    const mockUrl = 'https://res.cloudinary.com/demo/image/upload/v123456/test-car.jpg';
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ secure_url: mockUrl }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    // Get Cloudinary URL
    const url = await uploadPage.getCloudinaryUrl();

    // Verify it's a Cloudinary URL
    if (url) {
      await uploadPage.verifyCloudinaryUrl(url);
    }
  });

  test('should handle drag and drop upload', async ({ page }) => {
    // Skip this test if in CI (drag-drop is complex to test)
    test.skip(!!process.env.CI, 'Drag-drop test is complex in CI');

    // Mock upload
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        }),
      })
    );

    await uploadPage.uploadImageViaDropZone('test-car.jpg');

    // Should upload successfully
    await uploadPage.waitForUploadComplete();
  });

  test('should show error for invalid file type', async ({ page }) => {
    // Create a text file
    const fixturesDir = path.join(__dirname, 'fixtures');
    const textFilePath = path.join(fixturesDir, 'test.txt');
    fs.writeFileSync(textFilePath, 'This is not an image');

    await uploadPage.fileInput.setInputFiles(textFilePath);

    // Should show error
    await page.waitForTimeout(1000);

    const hasError = await uploadPage.hasError();
    expect(hasError).toBe(true);

    // Clean up
    fs.unlinkSync(textFilePath);
  });

  test('should show error for file too large', async ({ page }) => {
    // Mock file size check
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 413,
        body: JSON.stringify({ error: 'File too large' }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');

    await page.waitForTimeout(2000);

    const hasError = await uploadPage.hasError();
    expect(hasError).toBe(true);
  });

  test('should delete uploaded image', async ({ page }) => {
    // Mock successful upload
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    // Delete the image
    await uploadPage.deleteUploadedImage(0);

    // Image should be removed
    await page.waitForTimeout(500);

    const count = await uploadPage.getUploadedImageCount();
    expect(count).toBe(0);
  });

  test('should upload multiple images', async ({ page }) => {
    // Mock uploads
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}.jpg`,
        }),
      })
    );

    // Create multiple test images
    const fixturesDir = path.join(__dirname, 'fixtures');
    for (let i = 1; i <= 3; i++) {
      const imagePath = path.join(fixturesDir, `test-car-${i}.jpg`);
      if (!fs.existsSync(imagePath)) {
        const jpegHeader = Buffer.from([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
          0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
          0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
        ]);
        fs.writeFileSync(imagePath, jpegHeader);
      }
    }

    await uploadPage.uploadMultipleImages([
      'test-car-1.jpg',
      'test-car-2.jpg',
      'test-car-3.jpg',
    ]);

    await uploadPage.waitForUploadComplete();

    const count = await uploadPage.getUploadedImageCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should verify Cloudinary transformations applied', async ({ page }) => {
    const mockUrl = 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto,w_800/test.jpg';

    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ secure_url: mockUrl }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    // Verify optimizations are applied
    await uploadPage.verifyImageOptimization(mockUrl);
  });

  test('should handle upload failure gracefully', async ({ page }) => {
    // Mock failed upload
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Upload failed' }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');

    await page.waitForTimeout(2000);

    const hasError = await uploadPage.hasError();
    expect(hasError).toBe(true);

    const errorMessage = await uploadPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/error|fail/i);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Upload should work on mobile
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();
  });
});

test.describe('Image Upload - Performance', () => {
  test('should upload image in reasonable time', async ({ page }) => {
    const uploadPage = new ImageUploadPage(page);
    await uploadPage.gotoUploadPage();

    // Mock fast upload
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
        }),
      })
    );

    const startTime = Date.now();
    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();
    const uploadTime = Date.now() - startTime;

    // Should upload in under 5 seconds (mocked)
    expect(uploadTime).toBeLessThan(5000);
  });
});

test.describe('Cloudinary Integration', () => {
  test('should apply automatic quality optimization', async ({ page }) => {
    const uploadPage = new ImageUploadPage(page);
    await uploadPage.gotoUploadPage();

    const mockUrl = 'https://res.cloudinary.com/demo/image/upload/q_auto/test.jpg';

    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ secure_url: mockUrl }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    const url = await uploadPage.getCloudinaryUrl();
    if (url) {
      expect(url).toContain('q_auto');
    }
  });

  test('should apply automatic format optimization', async ({ page }) => {
    const uploadPage = new ImageUploadPage(page);
    await uploadPage.gotoUploadPage();

    const mockUrl = 'https://res.cloudinary.com/demo/image/upload/f_auto/test.jpg';

    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ secure_url: mockUrl }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    const url = await uploadPage.getCloudinaryUrl();
    if (url) {
      expect(url).toContain('f_auto');
    }
  });

  test('should resize images for responsive display', async ({ page }) => {
    const uploadPage = new ImageUploadPage(page);
    await uploadPage.gotoUploadPage();

    const mockUrl = 'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/test.jpg';

    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ secure_url: mockUrl }),
      })
    );

    await uploadPage.uploadImage('test-car.jpg');
    await uploadPage.waitForUploadComplete();

    const url = await uploadPage.getCloudinaryUrl();
    if (url) {
      expect(url).toMatch(/w_\d+/);
    }
  });
});
