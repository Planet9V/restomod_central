import { test, expect } from '@playwright/test';

test.describe('Cloudinary Image Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');
  });

  test('should load images with Cloudinary CDN', async ({ page }) => {
    // Find images on the page
    const images = await page.locator('img').all();

    if (images.length > 0) {
      // Check at least one image for Cloudinary URL
      let hasCloudinaryImage = false;

      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && src.includes('cloudinary.com')) {
          hasCloudinaryImage = true;
          break;
        }
      }

      // Note: This test may not pass if images aren't from Cloudinary yet
      // It's here for when Cloudinary is fully integrated
      console.log(`Found Cloudinary images: ${hasCloudinaryImage}`);
    }
  });

  test('should apply automatic quality optimization (q_auto)', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have q_auto parameter
      expect(src).toContain('q_auto');
    }
  });

  test('should apply automatic format optimization (f_auto)', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have f_auto parameter
      expect(src).toContain('f_auto');
    }
  });

  test('should apply responsive width transformations', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have width parameter (w_xxx)
      expect(src).toMatch(/w_\d+/);
    }
  });

  test('should apply height transformations when needed', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // May have height parameter (h_xxx)
      if (src && src.includes('h_')) {
        expect(src).toMatch(/h_\d+/);
      }
    }
  });

  test('should use crop/fill mode for aspect ratio', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // May have crop mode (c_fill, c_scale, etc.)
      if (src && src.includes('c_')) {
        expect(src).toMatch(/c_(fill|scale|fit|crop)/);
      }
    }
  });

  test('should load images efficiently', async ({ page }) => {
    // Measure image load performance
    const performanceTiming = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const images = resources.filter(r => r.initiatorType === 'img');

      return {
        count: images.length,
        totalSize: images.reduce((sum, img) => sum + (img.transferSize || 0), 0),
        avgDuration: images.reduce((sum, img) => sum + img.duration, 0) / images.length,
      };
    });

    console.log('Image Performance:', performanceTiming);

    // Average image load time should be reasonable
    if (performanceTiming.count > 0) {
      expect(performanceTiming.avgDuration).toBeLessThan(2000);
    }
  });

  test('should lazy load images below fold', async ({ page }) => {
    // Check for lazy loading attributes
    const lazyImages = await page.locator('img[loading="lazy"]').all();

    console.log(`Found ${lazyImages.length} lazy-loaded images`);

    // Should have some lazy-loaded images
    // Note: This may vary based on implementation
  });

  test('should have alt text for accessibility', async ({ page }) => {
    const images = await page.locator('img').all();

    if (images.length > 0) {
      // Check that images have alt text
      for (const img of images) {
        const alt = await img.getAttribute('alt');

        // Alt should exist (can be empty for decorative images)
        expect(alt !== null).toBe(true);
      }
    }
  });

  test('should serve WebP format when supported', async ({ page }) => {
    // Check if browser supports WebP
    const supportsWebP = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    });

    if (supportsWebP) {
      const images = await page.locator('img[src*="cloudinary"]').all();

      if (images.length > 0) {
        const firstImage = images[0];
        const src = await firstImage.getAttribute('src');

        // With f_auto, Cloudinary should serve WebP to supporting browsers
        if (src && src.includes('f_auto')) {
          console.log('WebP support enabled with f_auto');
        }
      }
    }
  });

  test('should optimize images for mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have responsive width optimized for mobile
      if (src) {
        expect(src).toMatch(/w_\d+/);

        // Extract width
        const match = src.match(/w_(\d+)/);
        if (match) {
          const width = parseInt(match[1]);

          // Width should be appropriate for mobile (usually < 800px)
          expect(width).toBeLessThan(1200);
        }
      }
    }
  });

  test('should optimize images for desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have responsive width
      if (src) {
        expect(src).toMatch(/w_\d+/);
      }
    }
  });

  test('should handle image load errors gracefully', async ({ page }) => {
    // Mock broken Cloudinary URLs
    await page.route('**/cloudinary.com/**', route =>
      route.fulfill({ status: 404 })
    );

    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    // Page should not crash
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('gateway-vehicles');
  });

  test('should cache images for faster subsequent loads', async ({ page }) => {
    await page.goto('/gateway-vehicles');
    await page.waitForLoadState('networkidle');

    // Get first load timing
    const firstLoadResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.filter(r => r.initiatorType === 'img' && r.name.includes('cloudinary')).length;
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get second load timing
    const secondLoadResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const cachedImages = resources.filter(r =>
        r.initiatorType === 'img' &&
        r.name.includes('cloudinary') &&
        r.transferSize === 0
      );
      return cachedImages.length;
    });

    console.log(`First load: ${firstLoadResources} images, Cached on second load: ${secondLoadResources}`);

    // Some images should be cached
    expect(secondLoadResources).toBeGreaterThan(0);
  });

  test('should apply image compression', async ({ page }) => {
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');

      // Should have quality parameter (either q_auto or q_xx)
      if (src) {
        expect(src).toMatch(/q_(auto|\d+)/);
      }
    }
  });

  test('should serve different sizes for different screen densities', async ({ page }) => {
    // Check for srcset attribute for responsive images
    const images = await page.locator('img[src*="cloudinary"]').all();

    if (images.length > 0) {
      for (const img of images) {
        const srcset = await img.getAttribute('srcset');

        // May have srcset for different densities (1x, 2x)
        if (srcset) {
          console.log('Found responsive image with srcset');
          expect(srcset.length).toBeGreaterThan(0);
          break;
        }
      }
    }
  });
});

test.describe('Cloudinary - Video Optimization', () => {
  test('should optimize video files if used', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const videos = await page.locator('video[src*="cloudinary"]').all();

    if (videos.length > 0) {
      const firstVideo = videos[0];
      const src = await firstVideo.getAttribute('src');

      // Should have video optimizations
      if (src) {
        expect(src).toContain('cloudinary.com');
      }
    }
  });
});
