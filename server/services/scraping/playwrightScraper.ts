// Playwright Stealth Scraper
// Bypasses anti-bot detection for JavaScript-heavy sites

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { PlaywrightScraperConfig, ScrapeResult, RawListing } from '../../types/scraping';
import { getRandomUserAgent, delay, randomDelay, checkRobotsPermission } from './utils';

// Apply stealth plugin
chromium.use(StealthPlugin());

/**
 * Main Playwright scraper with anti-bot bypass
 */
export async function scrapeWithPlaywright(
  config: PlaywrightScraperConfig
): Promise<ScrapeResult<RawListing>> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let pagesCrawled = 0;

  try {
    // Check robots.txt
    const isAllowed = await checkRobotsPermission(config.url);
    if (!isAllowed) {
      return {
        success: false,
        error: 'Blocked by robots.txt',
      };
    }

    // Launch browser with anti-detection args
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        config.useProxy && config.proxyUrl ? `--proxy-server=${config.proxyUrl}` : '',
      ].filter(Boolean),
    });

    // Create context with realistic settings
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: config.selectors?.userAgent || getRandomUserAgent(),
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: [],
      colorScheme: 'light',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    // Remove webdriver flag and add realistic navigator properties
    await context.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Add realistic plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            name: 'Chrome PDF Plugin',
            filename: 'internal-pdf-viewer',
            description: 'Portable Document Format',
          },
          {
            name: 'Chrome PDF Viewer',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            description: '',
          },
        ],
      });

      // Override chrome runtime
      if (!window.chrome) {
        (window as any).chrome = { runtime: {} };
      }

      // Override permissions
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: 'denied' } as any) :
          originalQuery(parameters)
      );
    });

    const page = await context.newPage();

    // Navigate with random delay
    console.log(`[Playwright] Navigating to: ${config.url}`);
    await page.goto(config.url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // Random delay to mimic human behavior
    await randomDelay(...(config.delayRange || [1000, 3000]));

    // Random mouse movements
    await simulateHumanBehavior(page);

    // Scroll to load lazy images
    await autoScroll(page, config.scrollBehavior || 'smooth');
    await randomDelay(1000, 2000);

    // Extract listings from current page
    let allListings: RawListing[] = [];

    if (!config.selectors) {
      throw new Error('No selectors provided');
    }

    const listings = await extractListings(page, config.selectors);
    allListings.push(...listings);
    pagesCrawled++;

    console.log(`[Playwright] Page 1: Found ${listings.length} listings`);

    // Handle pagination if configured
    if (config.pagination) {
      const maxPages = config.pagination.maxPages || 5;

      for (let pageNum = 2; pageNum <= maxPages; pageNum++) {
        const hasNextPage = await navigateToNextPage(page, config.pagination);

        if (!hasNextPage) {
          console.log(`[Playwright] No more pages found`);
          break;
        }

        // Wait for page load
        await page.waitForLoadState('networkidle');
        await randomDelay(...(config.delayRange || [2000, 4000]));

        // Extract listings from this page
        const pageListings = await extractListings(page, config.selectors);
        allListings.push(...pageListings);
        pagesCrawled++;

        console.log(`[Playwright] Page ${pageNum}: Found ${pageListings.length} listings (total: ${allListings.length})`);

        // Break if no listings found
        if (pageListings.length === 0) {
          console.log(`[Playwright] No listings found, stopping pagination`);
          break;
        }
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: allListings,
      metadata: {
        itemsFound: allListings.length,
        pagesCrawled,
        duration,
        timestamp: new Date(),
      },
    };

  } catch (error: any) {
    console.error('[Playwright] Scraping failed:', error);

    return {
      success: false,
      error: error.message,
      metadata: {
        itemsFound: 0,
        pagesCrawled,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      },
    };

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract listings from page using selectors
 */
async function extractListings(page: Page, selectors: any): Promise<RawListing[]> {
  return await page.$$eval(selectors.listing, (elements: Element[], sel: any) => {
    return elements.map(el => {
      const getListing = (selector: string): string | null => {
        const element = el.querySelector(selector);
        return element?.textContent?.trim() || element?.getAttribute('href') || element?.getAttribute('src') || null;
      };

      return {
        title: getListing(sel.title),
        price: getListing(sel.price),
        make: sel.make ? getListing(sel.make) : undefined,
        model: sel.model ? getListing(sel.model) : undefined,
        year: sel.year ? getListing(sel.year) : undefined,
        image: sel.image ? getListing(sel.image) : undefined,
        description: sel.description ? getListing(sel.description) : undefined,
        location: sel.location ? getListing(sel.location) : undefined,
        url: el.querySelector('a')?.getAttribute('href') || undefined,
      };
    });
  }, selectors);
}

/**
 * Navigate to next page based on pagination config
 */
async function navigateToNextPage(page: Page, pagination: any): Promise<boolean> {
  if (pagination.type === 'click' && pagination.selector) {
    try {
      const nextButton = await page.$(pagination.selector);

      if (!nextButton) {
        return false;
      }

      // Check if button is disabled
      const isDisabled = await nextButton.evaluate((el: Element) => {
        return el.hasAttribute('disabled') || el.classList.contains('disabled');
      });

      if (isDisabled) {
        return false;
      }

      // Click and wait for navigation
      await Promise.all([
        page.waitForLoadState('networkidle'),
        nextButton.click(),
      ]);

      return true;

    } catch (error) {
      console.error('[Playwright] Failed to click next page:', error);
      return false;
    }
  }

  if (pagination.type === 'url' && pagination.urlPattern) {
    try {
      const currentUrl = page.url();
      const urlObj = new URL(currentUrl);

      // Extract page number from current URL
      const pageMatch = currentUrl.match(/page[=\/](\d+)/i);
      const currentPage = pageMatch ? parseInt(pageMatch[1], 10) : 1;
      const nextPage = currentPage + 1;

      // Build next URL
      const nextUrl = pagination.urlPattern.replace('{page}', nextPage.toString());

      await page.goto(nextUrl, { waitUntil: 'networkidle' });

      return true;

    } catch (error) {
      console.error('[Playwright] Failed to navigate to URL:', error);
      return false;
    }
  }

  if (pagination.type === 'infinite_scroll') {
    try {
      const previousHeight = await page.evaluate(() => document.body.scrollHeight);

      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for new content
      await delay(2000);

      const newHeight = await page.evaluate(() => document.body.scrollHeight);

      // Check if page height increased (new content loaded)
      return newHeight > previousHeight;

    } catch (error) {
      console.error('[Playwright] Failed infinite scroll:', error);
      return false;
    }
  }

  return false;
}

/**
 * Auto-scroll page to load lazy images
 */
async function autoScroll(page: Page, behavior: 'smooth' | 'instant' = 'smooth') {
  await page.evaluate(async (scrollBehavior: ScrollBehavior) => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy({ top: distance, behavior: scrollBehavior });
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  }, behavior);

  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Simulate human behavior (mouse movements, scrolling)
 */
async function simulateHumanBehavior(page: Page) {
  // Random mouse movements
  const randomX = Math.floor(Math.random() * 1920);
  const randomY = Math.floor(Math.random() * 1080);

  await page.mouse.move(randomX, randomY, {
    steps: 10,
  });

  // Random small scroll
  await page.evaluate(() => {
    window.scrollBy({
      top: Math.random() * 200,
      behavior: 'smooth',
    });
  });

  await delay(500);
}

/**
 * Retry scraping with exponential backoff
 */
export async function scrapeWithRetry(
  config: PlaywrightScraperConfig,
  maxRetries: number = 3
): Promise<ScrapeResult<RawListing>> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeWithPlaywright(config);

      if (result.success) {
        return result;
      }

      // Partial success - return what we have
      if (result.data && result.data.length > 0) {
        console.warn(`[Playwright] Partial success on attempt ${attempt}`);
        return result;
      }

      // Total failure - retry
      throw new Error(result.error);

    } catch (error: any) {
      console.error(`[Playwright] Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Failed after ${maxRetries} attempts: ${error.message}`,
        };
      }

      // Exponential backoff: 2s, 4s, 8s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`[Playwright] Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
  };
}

/**
 * Take screenshot for debugging
 */
export async function scrapeWithScreenshot(
  config: PlaywrightScraperConfig,
  screenshotPath: string
): Promise<ScrapeResult<RawListing>> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(config.url);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const result = await scrapeWithPlaywright(config);

    return result;

  } finally {
    await browser.close();
  }
}
